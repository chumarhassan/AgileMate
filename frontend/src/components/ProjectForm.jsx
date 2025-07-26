// src/components/ProjectForm.jsx
import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase auth client instance

const ProjectForm = ({ onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Ensure user is logged in and get their ID token
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to create a project.');
      setLoading(false);
      return;
    }

    try {
      const idToken = await user.getIdToken(); // Get the ID token

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // Send the ID token
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const newProject = await response.json();
      alert('Project created successfully!');
      setName('');
      setDescription('');
      if (onProjectCreated) {
        onProjectCreated(newProject); // Notify parent component
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h3 className="form-title">Create New Project</h3>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="name">Project Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="input-field textarea-field"
            rows="3"
            disabled={loading}
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;