import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import DailyStandupForm from './components/DailyStandupForm'; // Import new component
import DailyStandupSummary from './components/DailyStandupSummary'; // Import new component
import { auth } from './firebase';

function App() {
  const [backendMessage, setBackendMessage] = useState('Connecting to backend...');
  const [error, setError] = useState(null);
  const [projectListKey, setProjectListKey] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      // If user logs out, clear selected project
      if (!user) {
        setSelectedProject(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/status');
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
  }, []);

  const handleProjectCreated = (newProject) => {
    console.log('New project created:', newProject);
    setProjectListKey(prevKey => prevKey + 1);
    setSelectedProject(newProject); // Auto-select new project
  };

  const handleProjectSelected = (project) => {
    setSelectedProject(project);
    console.log('Project selected:', project.name);
  };

  // Function to refresh the daily standup summary
  const refreshDailySummary = () => {
    // We'll use a key prop on DailyStandupSummary to force re-render
    // or a state update that its useEffect watches. For simplicity, just refetch
    // if the component itself handles fetching. No direct action here needed.
    // The DailyStandupSummary component already has a useEffect watching projectId and selectedDate.
    // We can optionally pass a refetch trigger if needed for more complex scenarios.
  };


  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div className="logo">AgileMate</div>
          <nav>
            <ul className="nav-list">
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#settings">Settings</a></li>
              <li><Auth /></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <section className="hero-section">
            <h2>Welcome to AgileMate!</h2>
            <p>Your AI-Powered Scrum Master Assistant.</p>
            <p>Streamline your agile workflows and empower your team with intelligent automation.</p>
          </section>

          <section className="dashboard-summary">
            <h3>Backend Connection Status:</h3>
            {error ? (
              <p className="error-message">{error}</p>
            ) : (
              <p>{backendMessage}</p>
            )}
            <p className="status-info">This shows if your frontend can talk to your backend API.</p>
          </section>

          {isLoggedIn ? (
            <div className="project-management-section">
              {!selectedProject ? (
                <>
                  <ProjectForm onProjectCreated={handleProjectCreated} />
                  <ProjectList key={projectListKey} onProjectSelected={handleProjectSelected} />
                </>
              ) : (
                <div className="selected-project-view">
                  <div className="card-panel selected-project-details" style={{ marginBottom: '2rem' }}>
                    <h3 className="card-title">Project: {selectedProject.name}</h3>
                    <p>{selectedProject.description}</p>
                    <button onClick={() => setSelectedProject(null)}>← Back to All Projects</button>
                    {/* More details and actions for the selected project will go here */}
                  </div>

                  {/* Daily Standup Section */}
                  <DailyStandupForm
                    projectId={selectedProject.id}
                    onUpdateSubmitted={refreshDailySummary} // Pass callback to trigger summary refresh
                  />
                  <DailyStandupSummary
                    projectId={selectedProject.id}
                  />
                </div>
              )}
            </div>
          ) : (
            <section className="hero-section" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{fontSize: '1.2rem'}}>Please sign in to manage your projects and daily standups.</p>
            </section>
          )}


        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} AgileMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;