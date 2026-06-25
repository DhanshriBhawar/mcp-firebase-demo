import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, vapidKey } from '../firebase';

function NotificationCenter() {
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
  const [token, setToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState('not_generated');
  const [deliveryStatus, setDeliveryStatus] = useState('idle');
  const [showToken, setShowToken] = useState(false);
  const [backendStatus, setBackendStatus] = useState('');
  const [tokenExists, setTokenExists] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const apiPrefix = apiBaseUrl ? `${apiBaseUrl}/api` : '/api';

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);

      if (Notification.permission === 'granted' && payload && payload.notification) {
        try {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp4sTwr46qtL9LXXr4EGgxJLdAQTpp8UCQew&s',
          });
        } catch (e) {
          console.error('Failed to show notification:', e);
        }
      }

      setDeliveryStatus('foreground_message_received');
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const isVapidKeyValid = (key) => typeof key === 'string' && key.trim() !== '' && !key.includes('YOUR_');

  const handleEnable = async () => {
    setErrorMessage('');
    setDeliveryStatus('requesting_permission');

    if (!('serviceWorker' in navigator)) {
      setErrorMessage('Service workers are not supported by this browser.');
      setDeliveryStatus('unsupported');
      return;
    }

    if (!isVapidKeyValid(vapidKey)) {
      setErrorMessage('Invalid VAPID key. Update client/src/firebase.js with your Firebase VAPID public key.');
      setTokenStatus('error');
      setDeliveryStatus('error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        setTokenStatus('permission_denied');
        setDeliveryStatus('permission_denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey,
      });

      if (!currentToken) {
        setTokenStatus('token_failed');
        setDeliveryStatus('token_failed');
        setErrorMessage('Unable to generate FCM token.');
        return;
      }

      setToken(currentToken);
      setTokenStatus('generated');
      setShowToken(true);

      const response = await fetch(`${apiPrefix}/save-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: currentToken }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to save token to backend.');
      }

      setTokenStatus('saved');
      setDeliveryStatus('token_saved');
    } catch (error) {
      setErrorMessage(error.message || 'Unable to enable notifications.');
      setTokenStatus('error');
      setDeliveryStatus('error');
    }
  };

  const handleSendTest = async () => {
    setErrorMessage('');
    setDeliveryStatus('sending');

    try {
      const response = await fetch(`${apiPrefix}/send-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'FleetEdge Test', body: 'Hello from Firebase Web Push' }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to send push notification.');
      }

      setDeliveryStatus('sent');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to send the test notification.');
      setDeliveryStatus('error');
    }
  };

  const handleViewToken = () => {
    setShowToken(true);
    if (!token) {
      setErrorMessage('No token is available yet. Please enable notifications first.');
    }
  };

  return (
    <div className="notification-card container">
      <div className="section-heading">
        <h2>Notification Center</h2>
        <p>Use the buttons below to enable web push, save the FCM token, and send a test notification.</p>
      </div>

      <div className="notification-grid">
        <button className="btn" type="button" onClick={handleEnable}>
          Enable Notifications
        </button>
        <button className="btn" type="button" onClick={async () => {
          // Check backend status
          setErrorMessage('');
          try {
            const resp = await fetch(`${apiPrefix}/status`);
            const data = await resp.json();
            if (resp.ok && data.success) {
              setBackendStatus('Connected');
              setTokenExists(Boolean(data.tokenExists));
            } else {
              setBackendStatus('Disconnected');
            }
          } catch (err) {
            setBackendStatus('Disconnected');
            setErrorMessage('Unable to reach backend');
          }
        }}>
          Check Backend Status
        </button>
        <button className="btn" type="button" onClick={handleSendTest}>
          Send Test Notification
        </button>
        <button className="btn" type="button" onClick={handleViewToken}>
          View Token
        </button>
      </div>

      <div className="notification-status">
        <p>
          <strong>Permission Status:</strong> {permissionStatus}
        </p>
        <p>
          <strong>Token Status:</strong> {tokenStatus}
        </p>
        <p>
          <strong>Delivery Status:</strong> {deliveryStatus}
        </p>
        <p>
          <strong>Backend Status:</strong> {backendStatus || 'Unknown'}
        </p>
        <p>
          <strong>Token Exists:</strong> {String(tokenExists)}
        </p>
        {errorMessage && (
          <p style={{ color: '#b91c1c' }}>
            <strong>Error:</strong> {errorMessage}
          </p>
        )}
      </div>

      {showToken && (
        <div className="notification-token">
          <h3>FCM Token</h3>
          <textarea
            readOnly
            rows={5}
            value={token || 'No token available yet. Click Enable Notifications to generate one.'}
            style={{ width: '100%', borderRadius: '12px', padding: '1rem', fontFamily: 'monospace' }}
          />
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
