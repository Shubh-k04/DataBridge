# <img src="frontend/public/databridge.svg" alt="DataBridge Logo" width="40" height="40" style="vertical-align: middle;"> DataBridge

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A full-stack web application for managing and visualizing data from both MariaDB and MongoDB databases. The application allows users to upload CSV files, import data into either database system, and perform CRUD operations through an interactive interface.

## ✨ Features

<table>
    <tr>
        <td>🔄 Dual Database Support</td>
        <td>📤 CSV File Management</td>
        <td>📊 Interactive Tables</td>
    </tr>
    <tr>
        <td>✏️ In-place Editing</td>
        <td>🗑️ Bulk Operations</td>
        <td>🔍 Dynamic Filtering</td>
    </tr>
    <tr>
        <td>🌓 Dark/Light Theme</td>
        <td>📱 Responsive Design</td>
        <td>🚀 Fast Performance</td>
    </tr>
</table>

## 🛠️ Tech Stack

<table>
    <tr>
        <td align="center">Frontend</td>
        <td align="center">Backend</td>
        <td align="center">Database</td>
        <td align="center">DevOps</td>
    </tr>
    <tr>
        <td>
            <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" /><br>
            <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" /><br>
            <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" />
        </td>
        <td>
            <img src="https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white" /><br>
            <img src="https://img.shields.io/badge/SQLAlchemy-CC2927?style=flat&logo=python&logoColor=white" /><br>
            <img src="https://img.shields.io/badge/Pandas-150458?style=flat&logo=pandas&logoColor=white" />
        </td>
        <td>
            <img src="https://img.shields.io/badge/MariaDB-003545?style=flat&logo=mariadb&logoColor=white" /><br>
            <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" />
        </td>
        <td>
            <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" /><br>
            <img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=flat&logo=docker&logoColor=white" />
        </td>
    </tr>
</table>

## Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataTable.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── vite.config.js
├── backend/
│   ├── app.py
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Setup and Installation

1. Clone the repository:
        ```bash
        git clone https://github.com/Shubh-k04/DataBridge
        cd project-root
        ```

2. Create a `.env` file in the `backend` directory with the following variables:
        ```env
        DB_USER=root
        DB_PASSWORD=rootpassword
        DB_HOST=mariadb
        DB_PORT=3306
        DB_NAME=csv_dump
        MONGO_USER=root
        MONGO_PASSWORD=rootpassword
        MONGO_HOST=mongodb
        MONGO_PORT=27017
        MONGO_DB_NAME=your_database_name
        ```

3. Build and run the containers:
        ```bash
        docker-compose up --build
        ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Features in Detail

### Data Import
- Upload CSV files through the web interface
- Choose between MariaDB or MongoDB for data storage
- Automatic table creation based on CSV structure
- UTF-8 encoding support
- Chunk-based processing for large files

### Data Management
- View data in paginated tables
- Edit cell values directly in the table
- Delete single or multiple rows
- Dynamic switching between databases and tables
- Real-time data updates

### Error Handling
- Comprehensive error reporting
- File type validation
- Database connection error handling
- Data type validation during imports

## API Endpoints

### File Operations
- `POST /upload` - Upload CSV file
- `POST /import_csv_to_maria` - Import CSV to MariaDB
- `POST /import_csv_to_mongo` - Import CSV to MongoDB

### Data Operations
- `GET /get_tables` - Get available tables/collections
- `GET /get_data` - Get paginated data
- `PUT /update_maria_data` - Update MariaDB record
- `PUT /update_mongo_data/<id>` - Update MongoDB record
- `DELETE /delete_maria_data` - Delete MariaDB record
- `DELETE /delete_mongo_data/<id>` - Delete MongoDB record

## Development

To run the application in development mode:

1. Ensure Docker is installed and running on your machine.
2. Navigate to the project root directory.
3. Run the following command to start the application:
        ```bash
        docker-compose up
        ```
4. Access the application at [http://localhost:3000](http://localhost:3000).

For any changes made to the code, the application will automatically reload.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A full-stack web application for managing and visualizing data from both MariaDB and MongoDB databases. The application allows users to upload CSV files, import data into either database system, and perform CRUD operations through an interactive interface.

## ✨ Features

<table>
  <tr>
    <td>🔄 Dual Database Support</td>
    <td>📤 CSV File Management</td>
    <td>📊 Interactive Tables</td>
  </tr>
  <tr>
    <td>✏️ In-place Editing</td>
    <td>🗑️ Bulk Operations</td>
    <td>🔍 Dynamic Filtering</td>
  </tr>
  <tr>
    <td>🌓 Dark/Light Theme</td>
    <td>📱 Responsive Design</td>
    <td>🚀 Fast Performance</td>
  </tr>
</table>

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center">Frontend</td>
    <td align="center">Backend</td>
    <td align="center">Database</td>
    <td align="center">DevOps</td>
  </tr>
  <tr>
    <td>
      <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" /><br>
      <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" /><br>
      <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" />
    </td>
    <td>
      <img src="https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white" /><br>
      <img src="https://img.shields.io/badge/SQLAlchemy-CC2927?style=flat&logo=python&logoColor=white" /><br>
      <img src="https://img.shields.io/badge/Pandas-150458?style=flat&logo=pandas&logoColor=white" />
    </td>
    <td>
      <img src="https://img.shields.io/badge/MariaDB-003545?style=flat&logo=mariadb&logoColor=white" /><br>
      <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" />
    </td>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" /><br>
      <img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=flat&logo=docker&logoColor=white" />
    </td>
  </tr>
</table>

## Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataTable.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── vite.config.js
├── backend/
│   ├── app.py
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Setup and Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Shubh-k04/DataBridge
    cd project-root
    ```

2. Create a `.env` file in the `backend` directory with the following variables:
    ```env
    DB_USER=root
    DB_PASSWORD=rootpassword
    DB_HOST=mariadb
    DB_PORT=3306
    DB_NAME=csv_dump
    MONGO_USER=root
    MONGO_PASSWORD=rootpassword
    MONGO_HOST=mongodb
    MONGO_PORT=27017
    MONGO_DB_NAME=your_database_name
    ```

3. Build and run the containers:
    ```bash
    docker-compose up --build
    ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Features in Detail

### Data Import
- Upload CSV files through the web interface
- Choose between MariaDB or MongoDB for data storage
- Automatic table creation based on CSV structure
- UTF-8 encoding support
- Chunk-based processing for large files

### Data Management
- View data in paginated tables
- Edit cell values directly in the table
- Delete single or multiple rows
- Dynamic switching between databases and tables
- Real-time data updates

### Error Handling
- Comprehensive error reporting
- File type validation
- Database connection error handling
- Data type validation during imports

## API Endpoints

### File Operations
- `POST /upload` - Upload CSV file
- `POST /import_csv_to_maria` - Import CSV to MariaDB
- `POST /import_csv_to_mongo` - Import CSV to MongoDB

### Data Operations
- `GET /get_tables` - Get available tables/collections
- `GET /get_data` - Get paginated data
- `PUT /update_maria_data` - Update MariaDB record
- `PUT /update_mongo_data/<id>` - Update MongoDB record
- `DELETE /delete_maria_data` - Delete MariaDB record
- `DELETE /delete_mongo_data/<id>` - Delete MongoDB record

## Development

To run the application in development mode:

1. Ensure Docker is installed and running on your machine.
2. Navigate to the project root directory.
3. Run the following command to start the application:
    ```bash
    docker-compose up
    ```
4. Access the application at [http://localhost:3000](http://localhost:3000).

For any changes made to the code, the application will automatically reload.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

