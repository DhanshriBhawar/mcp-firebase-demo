import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/index.js';
import { logInfo, logError } from './loggingService.js';

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
if (!vapidKey) {
  throw new Error('VITE_FIREBASE_VAPID_KEY is required for Firebase messaging.');
}

const SERVICE_WORKER_PATH = '/firebase-messaging-sw.js';

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported by this browser.');
  }

  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  logInfo('Service worker registered:', SERVICE_WORKER_PATH);
  return registration;
};

export const generateFcmToken = async (serviceWorkerRegistration) => {
  if (!serviceWorkerRegistration) {
    throw new Error('Service worker registration is required to generate an FCM token.');
  }

  logInfo('Generating FCM token.');
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });

  if (!token) {
    throw new Error('Failed to generate FCM token.');
  }

  logInfo('FCM token generated.');
  return token;
};

export const registerForegroundListener = () => {
  onMessage(messaging, (payload) => {
    logInfo('Foreground Firebase message received.', payload);
  });
};
