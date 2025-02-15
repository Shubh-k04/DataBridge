# backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
import mysql.connector
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import pandas as pd
import math

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})  # Enable CORS for all routes

# MySQL (MariaDB) Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}?charset=utf8mb4"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# MongoDB Connection Setup
mongo_client = MongoClient(
    f"mongodb://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PASSWORD')}@"
    f"{os.getenv('MONGO_HOST')}:{os.getenv('MONGO_PORT')}/"
)
mongo_db = mongo_client[os.getenv('MONGO_DB_NAME')]
mongo_collection = mongo_db['filtered_data']

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database configuration for mysql.connector
DB_CONFIG = {
    "host": os.getenv('DB_HOST'),
    "user": os.getenv('DB_USER'),
    "password": os.getenv('DB_PASSWORD'),
    "database": os.getenv('DB_NAME'),
    "port": int(os.getenv('DB_PORT')),
    "charset": 'utf8mb4',
    "collation": 'utf8mb4_general_ci'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def import_csv_to_maria(file_path, table_name):
    """
    Reads the CSV file at file_path and imports it into the specified table in MariaDB.
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"Error: File not found at {file_path}")
            return {"error": "File not found"}
        
        print("Connecting to MariaDB...")
        mydb = mysql.connector.connect(**DB_CONFIG)
        cursor = mydb.cursor(buffered=True)
        
        # Set proper character set and collation
        cursor.execute("SET NAMES utf8mb4")
        cursor.execute("SET CHARACTER SET utf8mb4")
        cursor.execute("SET character_set_connection=utf8mb4")
        print("Connected successfully!")
        
        print("Reading CSV file...")
        df = pd.read_csv(file_path)
        df = df.dropna(axis=1, how='all')
        df.columns = [col.replace(" ", "_").replace("-", "_").replace(".", "_").replace("nan", "") 
                      for col in df.columns]
        
        print(f"Dropping existing table {table_name} (if exists)...")
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        mydb.commit()
        
        # Determine SQL column types based on pandas dtypes
        type_mapping = {
            'object': 'VARCHAR(255)',
            'int64': 'BIGINT',
            'float64': 'DOUBLE',
            'bool': 'BOOLEAN',
            'datetime64[ns]': 'DATETIME',
            'timedelta64[ns]': 'TIME',
            'category': 'VARCHAR(255)'
        }
        
        print("Creating new table...")
        create_table_query = f"CREATE TABLE {table_name} ("
        for col in df.columns:
            col_type = df[col].dtype.name
            if col_type == 'float64' and df[col].isna().sum() > df.shape[0] * 0.5:
                sql_type = 'VARCHAR(255)'
            else:
                sql_type = type_mapping.get(col_type, 'VARCHAR(255)')
            create_table_query += f"`{col}` {sql_type} NULL, "
        create_table_query = create_table_query.rstrip(', ') + ") CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"
        print("Executing query:")
        print(create_table_query)
        cursor.execute(create_table_query)
        mydb.commit()
        print("Table created successfully!")
        
        # Insert data in chunks
        chunksize = 25000
        total_rows = 0
        print("Starting data import...")
        for chunk in pd.read_csv(file_path, chunksize=chunksize):
            chunk = chunk.dropna(axis=1, how='all')
            chunk.columns = [col.replace(" ", "_").replace("-", "_").replace(".", "_").replace("nan", "") 
                             for col in chunk.columns]
            columns = ", ".join([f"`{col}`" for col in chunk.columns])
            placeholders = ", ".join(['%s'] * len(chunk.columns))
            sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
            data = [
                tuple(None if pd.isna(value) else value for value in row)
                for row in chunk.values
            ]
            try:
                cursor.executemany(sql, data)
                mydb.commit()
                total_rows += len(chunk)
                print(f"Inserted {total_rows} rows so far...")
            except mysql.connector.Error as err:
                print(f"Error inserting chunk: {err}")
                mydb.rollback()
                return {"error": str(err)}
        print(f"Import completed successfully! Total rows imported: {total_rows}")
        return {"message": f"CSV data imported successfully! Total rows: {total_rows}"}
    
    except mysql.connector.Error as err:
        error_msg = f"Database error: {str(err)}"
        print(error_msg)
        return {"error": error_msg}
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(error_msg)
        return {"error": error_msg}
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'mydb' in locals() and mydb.is_connected():
            mydb.close()
            print("Database connection closed.")

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save file in chunks
            chunk_size = 8192
            with open(filepath, 'wb') as f:
                while True:
                    chunk = file.stream.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
            
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename,
                'options': [
                    {'route': '/import_csv_to_maria', 'description': 'Import to MariaDB'},
                    {'route': '/import_csv_to_mongo', 'description': 'Import to MongoDB'}
                ]
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/import_csv_to_mongo', methods=['POST'])
def handle_mongo_import():
    try:
        data = request.get_json()
        filename = data.get('filename')
        collection_name = data.get('tableName')  # Get collection name from request
        
        if not filename or not collection_name:
            return jsonify({"error": "Filename and collection name must be provided"}), 400
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404
        
        # Get the collection dynamically
        collection = mongo_db[collection_name]
        
        # Drop existing collection if it exists
        collection.drop()
        
        # Import data in chunks using pandas
        df_iter = pd.read_csv(filepath, chunksize=1000)
        total_rows = 0
        
        for chunk in df_iter:
            records = chunk.to_dict('records')
            collection.insert_many(records)
            total_rows += len(records)
        
        # Remove file after import
        if os.path.exists(filepath):
            os.remove(filepath)
            
        return jsonify({
            "message": f"CSV data imported to MongoDB collection {collection_name} successfully!",
            "total_rows": total_rows
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/import_csv_to_maria', methods=['POST'])
def handle_maria_import():
    try:
        data = request.get_json()
        filename = data.get('filename')
        table_name = data.get('tableName')  # Get table name from request
        
        if not filename or not table_name:
            return jsonify({"error": "Filename and table name must be provided"}), 400
            
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
        
        # Pass table_name to import function
        result = import_csv_to_maria(filepath, table_name)
        
        # Clean up the uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)
            
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_mongo_data', methods=['GET'])
def get_mongo_data():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 1000))
        skip = (page - 1) * limit
        data = mongo_collection.find().skip(skip).limit(limit)
        result = []
        for doc in data:
            doc['_id'] = str(doc['_id'])
            result.append(doc)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_maria_data', methods=['GET'])
def get_maria_data():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        offset = (page - 1) * per_page

        # Create a new connection for each request
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        try:
            # Get total count
            cursor.execute("SELECT COUNT(*) as count FROM filtered_data")
            result = cursor.fetchone()
            total_count = result['count']

            # Get paginated data
            cursor.execute(f"SELECT * FROM filtered_data LIMIT {per_page} OFFSET {offset}")
            data = cursor.fetchall()

            return jsonify({
                "data": data,
                "total_count": total_count,
                "page": page,
                "per_page": per_page
            }), 200

        finally:
            cursor.close()
            connection.close()

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_mongo_data/<string:id>', methods=['PUT'])
def update_mongo_data(id):
    try:
        data = request.get_json()
        mongo_collection.update_one({'_id': ObjectId(id)}, {"$set": data})
        return jsonify({"message": "MongoDB data updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete_mongo_data/<string:id>', methods=['DELETE'])
def delete_mongo_data(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({"error": "Invalid ObjectId format"}), 400
        result = mongo_collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "MongoDB document not found"}), 404
        return jsonify({"message": "MongoDB data deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_maria_data', methods=['PUT'])
def update_maria_data():
    try:
        data = request.get_json()
        where_column = data.get('where_column')
        where_value = data.get('where_value')
        update_column = data.get('update_column')
        update_value = data.get('update_value')
        table_name = data.get('table_name')  # Get table name from request
        
        if not all([where_column, update_column, table_name]):
            return jsonify({"error": "Missing required parameters"}), 400
            
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        schema_cursor = connection.cursor(dictionary=True)
        
        # Verify column exists and get its type
        schema_cursor.execute(f"""
            SELECT DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = %s AND COLUMN_NAME = %s
        """, (table_name, update_column))
        
        column_info = schema_cursor.fetchone()
        if not column_info:
            return jsonify({"error": f"Unknown column: {update_column}"}), 400
        
        # Process update value based on column type
        col_type = column_info['DATA_TYPE'].lower()
        try:
            if col_type in ('decimal', 'int', 'bigint', 'float', 'double'):
                if isinstance(update_value, str) and update_value.lower() == 'null':
                    processed_value = None
                else:
                    processed_value = float(update_value) if col_type == 'float' else int(update_value)
            else:
                processed_value = update_value
        except ValueError:
            return jsonify({"error": f"Invalid value for column type {col_type}"}), 400
        
        # Update the record
        update_query = f"""
            UPDATE {table_name} 
            SET `{update_column}` = %s 
            WHERE `{where_column}` = %s
        """
        cursor.execute(update_query, (processed_value, where_value))
        connection.commit()
        
        return jsonify({"message": "Record updated successfully"}), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {str(err)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'schema_cursor' in locals():
            schema_cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()

@app.route('/delete_maria_data', methods=['DELETE'])
def delete_maria_data():
    try:
        data = request.get_json()
        unique_column = data.get('unique_column')
        unique_value = data.get('unique_value')
        table_name = data.get('table_name')  # Get table name from request
        
        if not all([unique_column, unique_value, table_name]):
            return jsonify({"error": "Missing required parameters"}), 400
            
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Delete the record
        delete_query = f"""
            DELETE FROM {table_name} 
            WHERE `{unique_column}` = %s
        """
        cursor.execute(delete_query, (unique_value,))
        connection.commit()
        
        return jsonify({"message": "Record deleted successfully"}), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {str(err)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()

@app.route('/delete_data', methods=['POST'])
def delete_data():
    try:
        data = request.json
        if not data or 'ids' not in data:
            return jsonify({"error": "No IDs provided"}), 400

        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        try:
            # Convert list of IDs to string for SQL IN clause
            id_list = ','.join(map(str, data['ids']))
            cursor.execute(f"DELETE FROM filtered_data WHERE id IN ({id_list})")
            connection.commit()

            return jsonify({
                "message": f"Successfully deleted {cursor.rowcount} rows"
            }), 200

        finally:
            cursor.close()
            connection.close()

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    return "Server is running!"

@app.route('/get_tables', methods=['GET'])
def get_tables():
    database = request.args.get('database')
    if not database:
        return jsonify({"error": "Database not specified"}), 400

    try:
        if database == 'mariadb':
            # Get MariaDB tables
            connection = mysql.connector.connect(**DB_CONFIG)
            cursor = connection.cursor()
            
            # Get tables from the current database
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = %s
            """, (DB_CONFIG['database'],))
            
            tables = [table[0] for table in cursor.fetchall()]
            cursor.close()
            connection.close()
            
            return jsonify({"tables": tables}), 200
            
        elif database == 'mongodb':
            # Get MongoDB collections
            collections = mongo_db.list_collection_names()
            # Filter out system collections
            user_collections = [
                coll for coll in collections 
                if not coll.startswith('system.') 
                and not coll.startswith('_')
            ]
            
            return jsonify({"tables": user_collections}), 200
            
        return jsonify({"error": "Invalid database selection"}), 400

    except Exception as e:
        print(f"Error fetching tables: {str(e)}")
        return jsonify({"error": f"Failed to fetch tables: {str(e)}"}), 500

@app.route('/get_data', methods=['GET'])
def get_data():
    try:
        database = request.args.get('database')
        table = request.args.get('table')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        
        if database == 'mariadb':
            connection = mysql.connector.connect(**DB_CONFIG)
            cursor = connection.cursor(dictionary=True)
            
            # Get total count
            cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
            total_count = cursor.fetchone()['count']
            
            # Get paginated data
            offset = (page - 1) * per_page
            cursor.execute(f"SELECT * FROM {table} LIMIT {per_page} OFFSET {offset}")
            data = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            return jsonify({
                "data": data,
                "total_count": total_count,
                "page": page,
                "per_page": per_page
            }), 200

        elif database == 'mongodb':
            skip = (page - 1) * per_page
            # Get total count
            total_count = mongo_db[table].count_documents({})
            
            # Fetch data with pagination
            cursor = mongo_db[table].find({}).skip(skip).limit(per_page)
            
            # Convert cursor to list and handle special values
            data = []
            for doc in cursor:
                # Convert ObjectId to string
                doc['_id'] = str(doc['_id'])
                # Handle NaN, Infinity, and -Infinity values
                processed_doc = {}
                for key, value in doc.items():
                    if isinstance(value, float):
                        if math.isnan(value):
                            processed_doc[key] = "NaN"
                        elif math.isinf(value):
                            if value > 0:
                                processed_doc[key] = "Infinity"
                            else:
                                processed_doc[key] = "-Infinity"
                        else:
                            processed_doc[key] = value
                    else:
                        processed_doc[key] = value
                data.append(processed_doc)
            
            return jsonify({
                "data": data,
                "total_count": total_count,
                "page": page,
                "per_page": per_page
            }), 200

        return jsonify({"error": "Invalid database selection"}), 400

    except Exception as e:
        return jsonify({"error": f"Error fetching data: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
