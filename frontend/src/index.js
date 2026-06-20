import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Firebase initialisation is delegated to services/firebase.js and consumed by
// context providers. This keeps the entry point environment‑agnostic.

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root">.');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);