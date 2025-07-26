// src/components/ProjectList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase'; // Import Firebase auth client instance
import { onAuthStateChanged } from 'firebase/auth'; // To react to auth state changes

const ProjectList = ({ onProjectSelected }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // To store current logged-in user

  // Function to fetch projects
  const fetchProjects = useCallback(async (user) => {
    if (!user) {
      setProjects([]); // Clear projects if no user
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const idToken = await user.getIdToken(); // Get ID token

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`, // Send the ID token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'An unexpected error occurred while fetching projects.');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, as user is passed explicitly

  // Listen for auth state changes to re-fetch projects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      fetchProjects(user); // Fetch projects whenever auth state changes
    });
    return () => unsubscribe();
  }, [fetchProjects]); // Re-run if fetchProjects callback changes

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!currentUser) return <p>Please log in to view your projects.</p>; // Show message if not logged in

  return (
    <div className="project-list-container card-panel">
      <h3 className="card-title">Your Projects</h3>
      {projects.length === 0 ? (
        <p>No projects found. Create one above!</p>
      ) : (
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id} className="project-item" onClick={() => onProjectSelected(project)}>
              <span className="project-name">{project.name}</span>
              <p className="project-description">{project.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;