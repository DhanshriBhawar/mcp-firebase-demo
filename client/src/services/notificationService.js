import { getToken } from 'firebase/messaging';
import { messaging, vapidKey } from '../firebase';

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mcp-firebase-demo-2.onrender.com';
const API_PREFIX = `${DEFAULT_API_BASE_URL.replace(/\/+$/, '')}/api`;
const DEFAULT_TIMEOUT_MS = 10000;
const MCP_POLL_INTERVAL_MS = 250;
const MCP_POLL_TIMEOUT_MS = 10000;

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

const isValidAnonymousId = (value) => typeof value === 'string' && value.trim().length >= 8;

const extractAnonymousIdFromObject = (source, visited = new WeakSet(), depth = 0) => {
  if (!source || typeof source !== 'object' || visited.has(source) || depth > 3) {
    return null;
  }

  visited.add(source);

  if (typeof source.getVisitorId === 'function') {
    const value = source.getVisitorId();
    if (isValidAnonymousId(value)) {
      return value;
    }
  }

  const keys = Object.keys(source);
  for (const key of keys) {
    const normalizedKey = key.toLowerCase();
    const value = source[key];

    if (
      isValidAnonymousId(value) &&
      ['anonymousid', 'anonymousid', 'visitorid', 'visitorid', 'id', 'uuid'].includes(normalizedKey)
    ) {
      return value;
    }
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'object' && value !== null) {
      const nested = extractAnonymousIdFromObject(value, visited, depth + 1);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const findMcpAnonymousId = () => {
  try {
    const candidates = [
      window.c360a,
      window.c360aData,
      window.mcp,
      window.MCP,
      window.sfmc,
      window._sfmc,
      window.digitalData,
      window.analytics,
      window.sfdc,
      window.salesforce,
    ];

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      const id = extractAnonymousIdFromObject(candidate);
      if (id) {
        return id;
      }
    }
  } catch (error) {
    log(`Error reading MCP anonymous ID: ${error.message}`);
  }

  return null;
};

const waitForMcpAnonymousId = async (timeoutMs = MCP_POLL_TIMEOUT_MS) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const id = findMcpAnonymousId();
    if (id) {
      return id;
    }
    await new Promise((resolve) => setTimeout(resolve, MCP_POLL_INTERVAL_MS));
  }
  return null;
};

const generateUuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `temp-${crypto.randomUUID()}`;
  }

  const randomPart = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `temp-${randomPart()}${randomPart()}-${randomPart()}-${randomPart()}-${randomPart()}-${randomPart()}${randomPart()}${randomPart()}`;
};

const isTemporaryAnonymousId = (anonymousId) => typeof anonymousId === 'string' && anonymousId.startsWith('temp-');

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

export const getAnonymousId = async () => {

    // Always try MCP first
    const mcpId = await waitForMcpAnonymousId(5000);

    if (isValidAnonymousId(mcpId)) {
        localStorage.setItem("anonymousId", mcpId);
        return mcpId;
    }

    // Then check local storage
    const storedId = localStorage.getItem("anonymousId");

    if (isValidAnonymousId(storedId)) {
        return storedId;
    }

    // Finally create a temp id
    const tempId = generateUuid();

    localStorage.setItem("anonymousId", tempId);

    return tempId;
};

const pollForRealAnonymousId = async (tempId) => {
  const realId = await waitForMcpAnonymousId(10000);
  const currentId = localStorage.getItem('anonymousId');

  if (!realId || currentId !== tempId) {
    return;
  }

  log('MCP Anonymous ID became available. Replacing temporary id.');
  localStorage.setItem('anonymousId', realId);

  const token = localStorage.getItem('fcmToken');
  if (token) {
    await saveTokenToBackend({
      anonymousId: realId,
      token,
      browser: navigator.userAgent,
      platform: navigator.platform,
    });
  }
};

export const saveTokenToBackend = async ({ anonymousId, token, browser, platform }) => {
  if (!anonymousId || !token) {
    throw new Error('anonymousId and token are required to save the token.');
  }

  log('Saving token...');
  const response = await fetchWithTimeout(`${API_PREFIX}/save-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      anonymousId,
      token,
      browser,
      platform,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to save token to backend.');
  }

  localStorage.setItem('fcmTokenSaved', 'true');
  log('Token saved successfully');
  return result;
};

export const saveToken = async (token) => {
  const anonymousId = await getAnonymousId();
  const browser = navigator.userAgent || null;
  const platform = navigator.platform || null;
  return saveTokenToBackend({ anonymousId, token, browser, platform });
};

export const sendTestNotification = async () => {
  const anonymousId = localStorage.getItem('anonymousId');
  if (!isValidAnonymousId(anonymousId)) {
    throw new Error('Unable to send test notification without an anonymousId.');
  }

  log('Sending test notification...');

  const response = await fetchWithTimeout(`${API_PREFIX}/send-push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      anonymousId,
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
    log('Initializing Notifications...');

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

    const anonymousId = await getAnonymousId();
    log(`Using anonymousId: ${anonymousId}`);

    const registration = await navigator.serviceWorker.ready;
    const token = await generateToken(registration);
    await saveToken(token);
    localStorage.setItem('fcmReady', 'true');

    log('Website ready for push notifications.');
    return { status: 'ready', token, anonymousId };
  } catch (error) {
    log(`Initialization failed: ${error.message}`);
    return { status: 'error', error: error.message };
  }
};
