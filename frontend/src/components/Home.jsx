import React from 'react';
import './Home.css';

function Home({ setView }) {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to DataBridge</h1>
        <p>A simple tool to import and manage your CSV data in MariaDB or MongoDB</p>
      </div>
      
      <div className="features">
        <div className="feature-card upload">
          <div className="card-content">
            <h3>Upload CSV</h3>
            <p>Import your CSV files with ease</p>
            <div className="db-info">
              <p>Upload and process your CSV files</p>
              <p>Support for large datasets</p>
            </div>
          </div>
          <button onClick={() => setView('upload')}>Start Uploading</button>
        </div>
        
        <div className="feature-card database">
          <div className="card-content">
            <h3>Choose Database</h3>
            <p>Store your data in MariaDB or MongoDB</p>
            <div className="db-info">
              <p><strong>MariaDB:</strong> Ideal for structured data with fixed schemas</p>
              <p><strong>MongoDB:</strong> Perfect for flexible, document-based storage</p>
            </div>
          </div>
          <button onClick={() => setView('upload')}>Choose Database</button>
        </div>
        
        <div className="feature-card view">
          <div className="card-content">
            <h3>View Data</h3>
            <p>Browse and analyze your imported data</p>
            <div className="db-info">
              <p>View and manage your imported data</p>
              <p>Edit and delete records easily</p>
            </div>
          </div>
          <button onClick={() => setView('data')}>View Data</button>
        </div>
      </div>
    </div>
  );
}

export default Home; 