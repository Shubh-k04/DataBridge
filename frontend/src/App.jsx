// frontend/src/App.jsx
import React, { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import UploadForm from './components/UploadForm'
import DataTable from './components/DataTable'
import './App.css'

function App() {
  // Simple state to switch between views (upload vs view data)
  const [view, setView] = useState('home')

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home setView={setView} />
      case 'upload':
        return <UploadForm setView={setView} />
      case 'data':
        return <DataTable />
      default:
        return <Home setView={setView} />
    }
  }

  return (
    <ThemeProvider>
      <div className="App">
        <Navbar currentView={view} setView={setView} />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
