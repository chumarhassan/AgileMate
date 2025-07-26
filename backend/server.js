require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// --- NEW: Import GitHub AI SDKs ---
const ModelClient = require("@azure-rest/ai-inference").default; // .default for CommonJS require
const { isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
// --- END NEW IMPORTS ---

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();
const authAdmin = admin.auth();

// --- NEW: Initialize GitHub AI Client ---
const githubAiClient = ModelClient(
  process.env.GITHUB_AI_ENDPOINT,
  new AzureKeyCredential(process.env.GITHUB_AI_TOKEN),
);
const GITHUB_AI_MODEL = process.env.GITHUB_AI_MODEL;
// --- END NEW CLIENT INITIALIZATION ---

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// --- Authentication Middleware (unchanged) ---
const authenticateToken = async (req, res, next) => {
  const idToken = req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'No ID token provided. Unauthorized.' });
  }
  try {
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.message);
    return res.status(403).json({ error: 'Invalid or expired ID token. Forbidden.' });
  }
};
// --- End Authentication Middleware ---

// Basic Home Route (unchanged)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AgileMate Backend API is running!' });
});

// API Status Route (unchanged)
app.get('/api/status', async (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      service: 'AgileMate Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      firebaseConnected: true,
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

// Project Management Routes (unchanged)
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.uid;

    if (!name || !description) {
      return res.status(400).json({ error: 'Project name and description are required.' });
    }

    const newProject = {
      name,
      description,
      ownerId,
      members: [ownerId],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('projects').add(newProject);
    res.status(201).json({ id: docRef.id, ...newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project.', details: error.message });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const projectsSnapshot = await db.collection('projects')
      .where('members', 'array-contains', userId)
      .get();

    const projects = [];
    projectsSnapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects.', details: error.message });
  }
});

// Daily Standup Routes (POST /api/daily-updates unchanged)
app.post('/api/daily-updates', authenticateToken, async (req, res) => {
  try {
    const { projectId, whatDidI_Yesterday, whatWillI_Today, blockers } = req.body;
    const userId = req.user.uid;
    const userName = req.user.name || req.user.email;

    if (!projectId || !whatDidI_Yesterday || !whatWillI_Today) {
      return res.status(400).json({ error: 'Project ID, yesterday\'s update, and today\'s plan are required.' });
    }

    const date = new Date().toISOString().split('T')[0];

    const newUpdate = {
      projectId,
      userId,
      userName,
      date,
      whatDidI_Yesterday,
      whatWillI_Today,
      blockers: blockers || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('dailyUpdates').add(newUpdate);
    res.status(201).json({ id: docRef.id, ...newUpdate });
  } catch (error) {
    console.error('Error submitting daily update:', error);
    res.status(500).json({ error: 'Failed to submit daily update.', details: error.message });
  }
});

// --- NEW: GET /api/daily-updates/summary/:projectId/:date using GitHub AI ---
app.get('/api/daily-updates/summary/:projectId/:date', authenticateToken, async (req, res) => {
  try {
    const { projectId, date } = req.params;
    const userId = req.user.uid;

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || !projectDoc.data().members.includes(userId)) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this project.' });
    }

    const updatesSnapshot = await db.collection('dailyUpdates')
      .where('projectId', '==', projectId)
      .where('date', '==', date)
      .orderBy('createdAt', 'asc')
      .get();

    if (updatesSnapshot.empty) {
      return res.status(200).json({ summary: 'No daily updates found for this date and project.', details: [] });
    }

    const dailyReports = [];
    updatesSnapshot.forEach(doc => dailyReports.push(doc.data()));

    const prompt = `Summarize the following daily standup reports from multiple team members for a Scrum project. Highlight key achievements, upcoming tasks, and all blockers. Each report is from a different team member for the same day:\n\n` +
                   dailyReports.map(r => `Member: ${r.userName}\nYesterday: ${r.whatDidI_Yesterday}\nToday: ${r.whatWillI_Today}\nBlockers: ${r.blockers || 'None'}`).join('\n\n') +
                   `\n\nProvide a concise summary focusing on progress, next steps, and all identified impediments.`;

    // --- NEW: Call GitHub AI Inference Client ---
    const response = await githubAiClient.path("/chat/completions").post({
      body: {
        messages: [
          { role:"system", content: "You are a helpful Scrum Master assistant that summarizes daily standups." }, // System message added
          { role:"user", content: prompt }
        ],
        temperature: 0.7,
        top_p: 1, // Keep this as provided
        model: GITHUB_AI_MODEL // Use the model from .env
      }
    });

    if (isUnexpected(response)) {
      console.error("GitHub AI Inference Error Response:", response.body.error);
      throw new Error(response.body.error.message || 'GitHub AI Inference failed');
    }

    const summary = response.body.choices[0].message.content;
    // --- END NEW AI CALL ---

    res.status(200).json({ summary, details: dailyReports });

  } catch (error) {
    console.error('Error generating daily standup summary (GitHub AI):', error);
    // More specific error handling for GitHub AI client
    if (error.message.includes('GitHub AI Inference failed')) { // Custom error from our isUnexpected check
      return res.status(500).json({ error: 'GitHub AI Inference Error', details: error.message });
    }
    res.status(500).json({ error: 'Failed to generate daily standup summary.', details: error.message });
  }
});
// --- End Daily Standup Routes ---

// Start the server
app.listen(PORT, () => {
  console.log(`AgileMate Backend server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});