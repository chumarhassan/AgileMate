// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import authentication service

// Your web app's Firebase configuration
// Replace with YOUR actual firebaseConfig from Firebase Console > Project settings > Your apps (web app)
const firebaseConfig = {
  apiKey: "AIzaSyCaCSu6zWGl1-Vbpe4_bImQ1o10GDzJQaY",
  authDomain: "agilemate-86e38.firebaseapp.com", // e.g., "agilemate-86e38.firebaseapp.com",
  projectId: "agilemate-86e38", // e.g., "agilemate-86e38",
  storageBucket: "agilemate-86e38.firebasestorage.app", // e.g., "agilemate-86e38.firebasestorage.app",
  messagingSenderId: "1008873931356", // e.g., "1008873931356",
  appId: "1:1008873931356:web:a28845ef90668b2cb11c99", // e.g., "1:1008873931356:web:a28845ef90668b2cb11c99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// You can also export other Firebase services here if you initialize them
// export const db = getFirestore(app); // if you add Firestore for frontend directly