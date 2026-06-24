import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Firebase messaging service worker registered.');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}
