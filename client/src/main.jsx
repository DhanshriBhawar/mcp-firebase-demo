import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

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

onMessage(messaging, (payload) => {
  console.log('========== FOREGROUND MESSAGE ==========');
  console.log(payload);

  if (Notification.permission === 'granted') {
    new Notification(payload.notification?.title || 'Notification', {
      body: payload.notification?.body || '',
      icon: '/favicon.ico',
    });
  }
});
