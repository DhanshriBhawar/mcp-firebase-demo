import { useCallback, useEffect, useState } from 'react';
import { initializeNotifications } from '../services/notificationService.js';

export const useNotificationInitialization = () => {
  const [notificationStatus, setNotificationStatus] = useState('initializing');
  const [token, setToken] = useState('');
  const [anonymousId, setAnonymousId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [initialized, setInitialized] = useState(false);

  const initialize = useCallback(async () => {
    setNotificationStatus('initializing');
    setErrorMessage('');
    setInitialized(false);

    const result = await initializeNotifications();
    setNotificationStatus(result.status || 'error');

    if (result.token) {
      setToken(result.token);
    }

    if (result.anonymousId) {
      setAnonymousId(result.anonymousId);
    }

    if (result.status === 'ready') {
      setInitialized(true);
    }

    if (result.error) {
      setErrorMessage(result.error);
    }

    return result;
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    notificationStatus,
    token,
    anonymousId,
    errorMessage,
    initialized,
    refresh: initialize,
  };
};
