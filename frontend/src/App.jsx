import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react';
function App() {
  return (
    <div className="app-container"> {/* This div maps to #root in CSS for full height */}
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">AgileMate</div>
          <nav>
            <ul className="nav-list">
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#settings">Settings</a></li>
              <li><a href="#login">Login</a></li> {/* Placeholder */}
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="container">
          <section className="hero-section">
            <h2>Welcome to AgileMate!</h2>
            <p>Your AI-Powered Scrum Master Assistant.</p>
            <p>Streamline your agile workflows and empower your team with intelligent automation.</p>
            <button>Get Started</button>
          </section>

          {/* Placeholder for future sections */}
          <section className="dashboard-summary">
            {/* This will eventually hold project summaries, sprint status etc. */}
            <h3>Your Agile Dashboard (Coming Soon!)</h3>
            <p>Here, you'll see an overview of your projects, upcoming sprints, and daily insights.</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} AgileMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
