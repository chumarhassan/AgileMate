// src/components/DailyStandupSummary.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm for GitHub Flavored Markdown

const DailyStandupSummary = ({ projectId }) => {
  const [summary, setSummary] = useState('');
  const [updatesDetails, setUpdatesDetails] = useState([]); // Keep if you want to display raw updates later
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchSummary = useCallback(async () => {
    if (!projectId || !selectedDate) {
      setSummary('');
      setUpdatesDetails([]);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to view summaries.');
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(`http://localhost:3000/api/daily-updates/summary/${projectId}/${selectedDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      setUpdatesDetails(data.details);
    } catch (err) {
      console.error('Error fetching daily standup summary:', err);
      setError(err.message || 'An unexpected error occurred while fetching summaries.');
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // No direct handleUpdateSubmitted needed here as App.jsx triggers refetch via prop changes

  return (
    <div className="card-panel daily-summary-section">
      <h3 className="card-title">Daily Standup Summary</h3>
      <div className="summary-options">
        <label htmlFor="summary-date">Select Date:</label>
        <input
          type="date"
          id="summary-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {loading && <p className="loading-message">Generating summary, please wait...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && summary ? ( // Only render if summary exists
        <div className="summary-content">
          {/* Use ReactMarkdown to render the summary */}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </div>
      ) : ( // Show empty state if no summary
        !loading && !error && <p className="empty-state-message">No summary available for this date. Submit daily updates!</p>
      )}
    </div>
  );
};

export default DailyStandupSummary;