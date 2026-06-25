import { getToken } from 'firebase/messaging';
import { messaging, vapidKey } from '../firebase';

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mcp-firebase-demo-2.onrender.com';
const API_PREFIX = `${DEFAULT_API_BASE_URL.replace(/\/+$/, '')}/api`;
const DEFAULT_TIMEOUT_MS = 10000;

const log = (message) => {
  console.log(`[NotificationService] ${message}`);
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out.');
    }
    throw error;
  }
};

export const requestPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported by this browser.');
  }

  if (Notification.permission === 'default') {
    log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    log(`Notification permission ${permission}`);
    return permission;
  }

  log(`Notification permission already ${Notification.permission}`);
  return Notification.permission;
};

export const generateToken = async (serviceWorkerRegistration) => {
  if (!serviceWorkerRegistration) {
    throw new Error('Service worker registration is required to generate the FCM token.');
  }

  log('Generating Firebase token...');
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });

  if (!token) {
    throw new Error('Firebase token generation failed.');
  }

  localStorage.setItem('fcmToken', token);
  log('Firebase token generated');
  return token;
};

export const saveTokenToBackend = async (token) => {
  if (!token) {
    throw new Error('No token available to save.');
  }

  log('Saving token to backend...');
  const response = await fetchWithTimeout(`${API_PREFIX}/save-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to save token to backend.');
  }

  localStorage.setItem('fcmTokenSaved', 'true');
  log('Token saved successfully');
  return result;
};

export const sendTestNotification = async () => {
  log('Sending test notification...');

  const response = await fetchWithTimeout(`${API_PREFIX}/send-push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Website Test Notification',
      body: 'This is a test notification from the website.',
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to send test notification.');
  }

  log('Test notification request sent.');
  return result;
};

export const initializeNotifications = async () => {
  try {
    if (!('Notification' in window)) {
      log('Notification API is not supported by this browser.');
      return { status: 'unsupported' };
    }

    if (!('serviceWorker' in navigator)) {
      log('Service workers are not supported by this browser.');
      return { status: 'unsupported' };
    }

    const permission = await requestPermission();
    if (permission !== 'granted') {
      log('Notification permission was not granted.');
      return { status: permission === 'denied' ? 'denied' : 'dismissed' };
    }

    const registration = await navigator.serviceWorker.ready;
    const token = await generateToken(registration);
    await saveTokenToBackend(token);
    localStorage.setItem('fcmReady', 'true');

    log('Website ready for push notifications.');
    return { status: 'ready', token };
  } catch (error) {
    log(`Initialization failed: ${error.message}`);
    return { status: 'error', error: error.message };
  }
};
