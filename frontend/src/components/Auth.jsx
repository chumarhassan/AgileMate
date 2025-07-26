// src/components/Auth.jsx
import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Import the auth instance from our firebase.js

const Auth = () => {
  const [user, setUser] = useState(null); // State to hold the logged-in user

  useEffect(() => {
    // This listener observes authentication state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User logged in:', currentUser.email);
        // Here you might redirect or update UI further
      } else {
        console.log('User logged out');
      }
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      // Handle specific errors, e.g., pop-up closed by user
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Google sign-in popup was closed. Please try again.');
      } else {
        alert(`Error during Google sign-in: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert(`Error during logout: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      {user ? (
        <div className="logged-in-state">
          <p>Welcome, {user.displayName || user.email}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
};

export default Auth;