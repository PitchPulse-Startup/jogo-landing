import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, applyActionCode } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyASZu8Xxpdv5PRRhkCIpsMqbuqoiVNL6ic",
  authDomain: "field-heatmap.firebaseapp.com",
  projectId: "field-heatmap",
  storageBucket: "field-heatmap.appspot.com",
  messagingSenderId: "493975986036",
  appId: "1:493975986036:web:93b4abfff9cfa94eb31621",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function AuthAction() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (mode !== 'verifyEmail' || !oobCode) {
      setError('Invalid or missing verification link.');
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => navigate('/email-verified', { replace: true }))
      .catch((err) => {
        console.error('Email verification failed:', err);
        if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
          setError('This verification link has expired or already been used. Please request a new one from the app.');
        } else {
          setError('Verification failed. Please try again from the app.');
        }
      });
  }, [navigate]);

  if (error) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0E0F0D', color: '#F7F6F1',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: 32, textAlign: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ fontSize: 18, color: '#c9cabf', maxWidth: 400, lineHeight: 1.5 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#0E0F0D',
    }}>
      <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#B6F03C" strokeWidth="8" strokeDasharray="62.8" strokeDashoffset="0">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
