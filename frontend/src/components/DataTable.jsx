// frontend/src/components/DataTable.jsx
import React, { useEffect, useState } from 'react'
import './DataTable.css'

function DataTable() {
  const [data, setData] = useState([])
  const [message, setMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedDB, setSelectedDB] = useState('')
  const [tableName, setTableName] = useState('')
  const [tables, setTables] = useState([])
  const rowsPerPage = 100
  const [isEditing, setIsEditing] = useState(false)
  const [allData, setAllData] = useState({})
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Fetch available tables when database is selected
  useEffect(() => {
    if (selectedDB) {
      fetchTables()
    }
  }, [selectedDB])

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      setMessage(''); // Clear any previous messages
      setTables([]); // Clear existing tables before fetching new ones
      setTableName(''); // Reset table selection
      
      const response = await fetch(
        `http://localhost:5000/get_tables?database=${selectedDB}`
      );
      
      const result = await response.json();
      
      if (response.status >= 400) {
        setMessage(result.error);
      } else {
        setTables(result.tables || []);
        setData([]); // Clear existing data
      }
    } catch (err) {
      setMessage(`Error fetching tables: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async (page) => {
    if (!selectedDB || !tableName) {
      setData([]);
      return;
    }
    
    // Check if we already have this page cached
    if (allData[page]) {
      setData(allData[page]);
      return;
    }

    setIsLoading(page === 1);
    setIsLoadingMore(page !== 1);
    
    try {
      const response = await fetch(
        `http://localhost:5000/get_data?database=${selectedDB}&table=${tableName}&page=${page}&per_page=${rowsPerPage}`
      );
      const result = await response.json();
      
      if (response.status >= 400) {
        setMessage(result.error);
      } else {
        setMessage(''); // Clear any error messages
        const newData = result.data || [];
        
        // Cache the new page data
        setAllData(prev => ({
          ...prev,
          [page]: newData
        }));
        
        setData(newData);
        setTotalPages(Math.ceil(result.total_count / rowsPerPage));
      }
    } catch (err) {
      setMessage(`Error fetching data: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (selectedDB && tableName) {
      fetchData(currentPage)
    }
  }, [currentPage, selectedDB, tableName])

  // Reset cache when database or table changes
  useEffect(() => {
    setAllData({});
  }, [selectedDB, tableName]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleRowSelect = (index) => {
    setSelectedRows(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      }
      return [...prev, index]
    })
  }

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      setMessage('Please select rows to delete')
      return
    }

    try {
      if (selectedDB === 'mongodb') {
        // MongoDB delete
        for (const rowIndex of selectedRows) {
          const id = data[rowIndex]._id
          const response = await fetch(
            `http://localhost:5000/delete_mongo_data/${id}`,
            { method: 'DELETE' }
          )
          if (!response.ok) throw new Error('Failed to delete from MongoDB')
        }
      } else if (selectedDB === 'mariadb') {
        // MariaDB delete
        for (const rowIndex of selectedRows) {
          const row = data[rowIndex]
          const response = await fetch(
            'http://localhost:5000/delete_maria_data',
            {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                unique_column: Object.keys(row)[0],
                unique_value: row[Object.keys(row)[0]],
                table_name: tableName
              })
            }
          )
          if (!response.ok) throw new Error('Failed to delete from MariaDB')
        }
      }

      setMessage('Records deleted successfully')
      setSelectedRows([])
      fetchData(currentPage)
    } catch (err) {
      setMessage(`Error deleting records: ${err.message}`)
    }
  }

  const handleEdit = async (rowIndex, columnName, newValue) => {
    try {
      const row = data[rowIndex];
      setMessage(''); // Clear any previous messages

      if (selectedDB === 'mongodb') {
        const response = await fetch(
          `http://localhost:5000/update_mongo_data/${row._id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [columnName]: newValue })
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to update MongoDB');
        }
        
        // Update local state
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [columnName]: newValue };
        setData(newData);
        
      } else if (selectedDB === 'mariadb') {
        const response = await fetch(
          'http://localhost:5000/update_maria_data',
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              where_column: Object.keys(row)[0], // First column as identifier
              where_value: row[Object.keys(row)[0]],
              update_column: columnName,
              update_value: newValue,
              table_name: tableName
            })
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to update MariaDB');
        }
        
        // Update local state
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [columnName]: newValue };
        setData(newData);
      }

      setMessage('Record updated successfully');
      
      // Optional: Refresh data from server to ensure consistency
      // await fetchData(currentPage);
      
    } catch (err) {
      setMessage(`Error updating record: ${err.message}`);
    }
  };

  // Update the database selection handler
  const handleDatabaseChange = (e) => {
    const newDB = e.target.value;
    setSelectedDB(newDB);
    setTableName(''); // Reset table selection
    setData([]); // Clear existing data
    setTables([]); // Clear existing tables
    if (newDB) {
      fetchTables(); // Fetch tables for the selected database
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Clear selected rows when exiting edit mode
    if (isEditing) {
      setSelectedRows([]);
    }
  };

  const handleCellClick = (rowIndex, columnName, currentValue) => {
    if (!isEditing) return;
    
    const newValue = prompt(`Edit ${columnName}:`, currentValue);
    if (newValue !== null && newValue !== currentValue) {
      handleEdit(rowIndex, columnName, newValue);
    }
  };

  return (
    <div className="data-table-container">
      <div className="database-selection">
        <h2>Select Database and Table</h2>
        <div className="selection-controls">
          <div className="select-group">
            <label>Database:</label>
            <select 
              value={selectedDB} 
              onChange={handleDatabaseChange}
            >
              <option value="">Select Database</option>
              <option value="mariadb">MariaDB</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </div>

          {selectedDB && (
            <div className="select-group">
              <label>Table:</label>
              <select 
                value={tableName} 
                onChange={(e) => {
                  setTableName(e.target.value);
                  setCurrentPage(1); // Reset to first page
                  setData([]); // Clear existing data
                }}
              >
                <option value="">Select Table</option>
                {tables && tables.length > 0 ? (
                  tables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))
                ) : (
                  <option value="" disabled>No tables available</option>
                )}
              </select>
            </div>
          )}
        </div>
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : selectedDB && tableName ? (
        <>
          <div className="table-controls">
            <h2>Data Table</h2>
            <div className="action-buttons">
              <button 
                className={`edit-button ${isEditing ? 'active' : ''}`}
                onClick={toggleEdit}
              >
                {isEditing ? 'Done Editing' : 'Edit'}
              </button>
              <button
                className="delete-button"
                onClick={handleDelete}
                disabled={selectedRows.length === 0}
              >
                Delete Selected
              </button>
            </div>
          </div>

          {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
          
          <div className="table-wrapper">
            <table>
              <thead>
                {data.length > 0 && (
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([...Array(data.length).keys()]);
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                        checked={selectedRows.length === data.length}
                      />
                    </th>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr 
                    key={i}
                    className={selectedRows.includes(i) ? 'selected' : ''}
                  >
                    <td data-label="Select">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(i)}
                        onChange={() => handleRowSelect(i)}
                      />
                    </td>
                    {Object.entries(row).map(([key, val]) => (
                      <td
                        key={key}
                        data-label={key} // Add data-label attribute here
                        onClick={() => handleCellClick(i, key, val)}
                        className={isEditing ? 'editable' : ''}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoadingMore && (
            <div className="loading-more">
              <div className="loader-small">Loading more...</div>
            </div>
          )}

          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoadingMore}
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoadingMore}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="select-prompt">
          {!selectedDB ? 'Please select a database' : 'Please select a table'}
        </div>
      )}
    </div>
  )
}

export default DataTable
