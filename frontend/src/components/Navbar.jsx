import React, { useState } from 'react';
import './Navbar.css';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ currentView, setView }) => {
  const { isDark, setIsDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (view) => {
    setView(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>DataBridge</h1>
      </div>
      
      <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <button 
          className={currentView === 'home' ? 'active' : ''} 
          onClick={() => handleNavClick('home')}
        >
          Home
        </button>
        <button 
          className={currentView === 'upload' ? 'active' : ''} 
          onClick={() => handleNavClick('upload')}
        >
          Upload CSV
        </button>
        <button 
          className={currentView === 'data' ? 'active' : ''} 
          onClick={() => handleNavClick('data')}
        >
          View Data
        </button>
        <button 
          className="theme-toggle"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;