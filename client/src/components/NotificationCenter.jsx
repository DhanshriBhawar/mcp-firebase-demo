import { useEffect, useState } from 'react';
import { initializeNotifications, sendTestNotification } from '../services/notificationService';

function NotificationCenter() {
  const [notificationStatus, setNotificationStatus] = useState('initializing');
  const [sendStatus, setSendStatus] = useState('idle');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      const result = await initializeNotifications();
      setNotificationStatus(result.status || 'error');
      if (result.token) {
        setToken(result.token);
      }
      if (result.error) {
        setErrorMessage(result.error);
      }
    };

    init();
  }, []);

  const handleSendTest = async () => {
    setErrorMessage('');
    setSendStatus('sending');

    try {
      await sendTestNotification();
      setSendStatus('sent');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to send the test notification.');
      setSendStatus('error');
    }
  };

  return (
    <div className="notification-card container">
      <div className="section-heading">
        <h2>Notification Center</h2>
        <p>
          Push notifications initialize automatically in the background. The button below is only for verifying delivery.
        </p>
      </div>

      <div className="notification-grid">
        <button className="btn" type="button" onClick={handleSendTest}>
          Send Test Notification
        </button>
      </div>

      <div className="notification-status">
        <p>
          <strong>Push Status:</strong> {notificationStatus}
        </p>
        <p>
          <strong>Test Send Status:</strong> {sendStatus}
        </p>
        {token && (
          <p>
            <strong>Token:</strong> {token.slice(0, 12)}...{token.slice(-8)}
          </p>
        )}
        {errorMessage && (
          <p style={{ color: '#b91c1c' }}>
            <strong>Error:</strong> {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;
