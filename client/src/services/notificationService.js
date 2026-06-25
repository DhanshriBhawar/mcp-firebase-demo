import { logInfo, logError } from './loggingService.js';
import { registerServiceWorker, generateFcmToken, registerForegroundListener } from './firebaseService.js';
import { waitForMcpAnonymousId } from './anonymousIdService.js';
import { saveTokenMapping } from './tokenService.js';

const LOCAL_FCM_TOKEN_KEY = 'fcmToken';
const LOCAL_MCP_ANONYMOUS_ID_KEY = 'mcpAnonymousId';

const requestPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported by this browser.');
  }

  if (Notification.permission === 'default') {
    logInfo('Requesting notification permission.');
    const permission = await Notification.requestPermission();
    logInfo('Notification permission result:', permission);
    return permission;
  }

  logInfo('Notification permission already set:', Notification.permission);
  return Notification.permission;
};

const cacheToken = (token) => {
  if (token) {
    localStorage.setItem(LOCAL_FCM_TOKEN_KEY, token);
  }
};

const cacheAnonymousId = (anonymousId) => {
  if (anonymousId) {
    localStorage.setItem(LOCAL_MCP_ANONYMOUS_ID_KEY, anonymousId);
  }
};

export const initializeNotifications = async () => {
  try {
    if (!('Notification' in window)) {
      return { status: 'unsupported', error: 'Browser does not support notifications.' };
    }

    if (!('serviceWorker' in navigator)) {
      return { status: 'unsupported', error: 'Browser does not support service workers.' };
    }

    const permission = await requestPermission();
    if (permission !== 'granted') {
      return {
        status: permission === 'denied' ? 'permission_denied' : 'permission_requested',
        error: 'Notification permission was not granted.',
      };
    }

    const serviceWorkerRegistration = await registerServiceWorker();
    const token = await generateFcmToken(serviceWorkerRegistration);
    cacheToken(token);

    const anonymousId = await waitForMcpAnonymousId({ intervalMs: 500, timeoutMs: 30000 });
    cacheAnonymousId(anonymousId);

    await saveTokenMapping({ anonymousId, token });
    registerForegroundListener();

    return { status: 'ready', token, anonymousId };
  } catch (error) {
    logError('Notification initialization failed.', error);
    return { status: 'error', error: error.message || 'Notification initialization failed.' };
  }
};
