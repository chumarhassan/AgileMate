// src/components/DailyStandupForm.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';

const DailyStandupForm = ({ projectId, onUpdateSubmitted }) => {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const user = auth.currentUser;
    if (!user || !projectId) {
      setError('You must be logged in and select a project to submit an update.');
      setLoading(false);
      return;
    }

    try {
      const idToken = await user.getIdToken();

      const response = await fetch('http://localhost:3000/api/daily-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          projectId,
          whatDidI_Yesterday: yesterday,
          whatWillI_Today: today,
          blockers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit daily update');
      }

      setSuccess(true);
      setYesterday('');
      setToday('');
      setBlockers('');
      if (onUpdateSubmitted) {
        onUpdateSubmitted(); // Notify parent to refresh summary
      }
      // Simple success message disappears after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error('Error submitting daily update:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card standup-form-card">
      <h3 className="card-title">Submit Daily Standup</h3>
      <p className="status-info">For Project: **{projectId}**</p> {/* Show current project ID */}
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Update submitted successfully!</p>}

        <div className="form-group">
          <label htmlFor="yesterday">What I did yesterday:</label>
          <textarea
            id="yesterday"
            value={yesterday}
            onChange={(e) => setYesterday(e.target.value)}
            required
            className="input-field textarea-field"
            rows="3"
            disabled={loading}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="today">What I will do today:</label>
          <textarea
            id="today"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            required
            className="input-field textarea-field"
            rows="3"
            disabled={loading}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="blockers">Blockers (optional):</label>
          <textarea
            id="blockers"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            className="input-field textarea-field"
            rows="2"
            disabled={loading}
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Update'}
        </button>
      </form>
    </div>
  );
};

export default DailyStandupForm;