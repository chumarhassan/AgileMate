// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(cors()); // Enable CORS for all origins (for development)

// Basic Home Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AgileMate Backend API is running!' });
});

// Example API Route (will expand later)
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AgileMate Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`AgileMate Backend server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});