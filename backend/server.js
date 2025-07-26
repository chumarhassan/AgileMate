require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin'); // Import Firebase Admin SDK

// Initialize Firebase Admin SDK
// Make sure your serviceAccountKey.json is in the backend directory
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com` // Optional, good practice if using Realtime DB
});

// Get a Firestore instance
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Basic Home Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AgileMate Backend API is running!' });
});

// Example API Route (updated to use Firestore instance)
app.get('/api/status', async (req, res) => {
  try {
    // You can even try a simple Firestore read here to confirm connection
    // (Optional: Requires a test collection/doc in Firestore)
    // const docRef = db.collection('settings').doc('appInfo');
    // const doc = await docRef.get();
    // console.log('Firestore Test Doc:', doc.exists ? doc.data() : 'No such document!');

    res.status(200).json({
      status: 'OK',
      service: 'AgileMate Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      firebaseConnected: true, // Indicates Firebase Admin SDK is initialized
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (error) {
    console.error("Error connecting to Firebase:", error);
    res.status(500).json({
      status: 'Error',
      service: 'AgileMate Backend',
      message: 'Failed to connect to Firebase Admin SDK',
      error: error.message
    });
  }
});

// New route to test Firestore write (optional, for direct testing)
app.post('/api/test-firestore', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    await db.collection('test_messages').add({
      message: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ success: true, message: 'Message added to Firestore' });
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    res.status(500).json({ error: 'Failed to write to Firestore' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`AgileMate Backend server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});