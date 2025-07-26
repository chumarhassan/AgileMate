import React, { useState, useEffect } from 'react';
// No need to import index.css here, it's already in main.jsx

function App() {
  const [backendMessage, setBackendMessage] = useState('Connecting to backend...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/status'); // Target your backend API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBackendMessage(`Backend Status: ${data.status} (Project: ${data.projectId}, Firebase Connected: ${data.firebaseConnected})`);
      } catch (e) {
        console.error("Failed to fetch backend status:", e);
        setError(`Failed to connect to backend: ${e.message}. Is the backend server running?`);
        setBackendMessage('Backend connection failed.');
      }
    };

    fetchBackendStatus();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="app-container">
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

          {/* Display Backend Status */}
          <section className="dashboard-summary" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '8px', backgroundColor: 'var(--color-secondary-purple)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <h3>Backend Connection Status:</h3>
            {error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : (
              <p>{backendMessage}</p>
            )}
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', marginTop: '0.5rem' }}>This shows if your frontend can talk to your backend API.</p>
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