// frontend/src/components/UploadForm.jsx
import React, { useState } from 'react'
import './UploadForm.css';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000';

function UploadForm({ setView }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedDB, setSelectedDB] = useState('')
  const [tableName, setTableName] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [importOptions, setImportOptions] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }
    if (!selectedDB) {
      setError('Please select a database')
      return
    }
    if (!tableName.trim()) {
      setError('Please enter a table name')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('tableName', tableName)
    
    setLoading(true)
    setError('')
    
    try {
      // First upload the file
      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      })
      
      if (!uploadResponse.ok) throw new Error('Upload failed')
      
      const uploadResult = await uploadResponse.json()
      
      // Then import to selected database
      const importEndpoint = selectedDB === 'mariadb' 
        ? '/import_csv_to_maria'
        : '/import_csv_to_mongo'
        
      const importResponse = await fetch(`${API_URL}${importEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uploadResult.filename,
          tableName: tableName
        }),
      })
      
      if (!importResponse.ok) throw new Error('Import failed')
      
      const importResult = await importResponse.json()
      setUploadedFile(uploadResult)
      setImportOptions(uploadResult.options)
      setSuccess(importResult.message)
      
      // Redirect to data view after 2 seconds
      setTimeout(() => setView('data'), 2000)
      
    } catch (err) {
      setError(err.message)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (route) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`http://localhost:5000${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uploadedFile.filename,
          tableName: tableName
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }
      
      setSuccess(result.message)
      setTimeout(() => setView('data'), 2000)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-form">
      <h2>Upload CSV File</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select CSV File:</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label>Table Name:</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
            required
          />
        </div>
        
        <div className="database-options">
          <h3>Select Database</h3>
          <div className="button-group">
            <button
              type="button"
              className={`db-button mariadb ${selectedDB === 'mariadb' ? 'active' : ''}`}
              onClick={() => setSelectedDB('mariadb')}
              disabled={loading}
            >
              MariaDB
            </button>
            <button
              type="button"
              className={`db-button mongodb ${selectedDB === 'mongodb' ? 'active' : ''}`}
              onClick={() => setSelectedDB('mongodb')}
              disabled={loading}
            >
              MongoDB
            </button>
          </div>
        </div>

        {loading && <div className="loader">Uploading and processing...</div>}
        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success-message">
            <h2>Success!</h2>
            <p>{success}</p>
            <p>Redirecting to data view...</p>
          </div>
        )}

        <button type="submit" disabled={loading || !file || !selectedDB || !tableName}>
          Upload and Import
        </button>
      </form>
    </div>
  )
}

export default UploadForm
    