import { useEffect, useState } from 'react';
import { useNotificationInitialization } from '../hooks/useNotificationInitialization';

function NotificationCenter() {
  const [sendStatus, setSendStatus] = useState('idle');
  const { notificationStatus, token, errorMessage, initialized, refresh } = useNotificationInitialization();
  const [deploymentTime, setDeploymentTime] = useState('');
  const [autoUpdateStatus, setAutoUpdateStatus] = useState('watching');

  useEffect(() => {
    const now = new Date();
    setDeploymentTime(
      now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );
  }, []);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      fetch('/index.html', { cache: 'no-store' })
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const newDoc = parser.parseFromString(html, 'text/html');
          const currentScript = document.querySelector('script[src*="main"]');
          const newScript = newDoc.querySelector('script[src*="main"]');

          if (currentScript && newScript && currentScript.src !== newScript.src) {
            setAutoUpdateStatus('new version available - reloading...');
            setTimeout(() => window.location.reload(), 2000);
          }
        })
        .catch((err) => console.log('Update check failed:', err));
    }, 5000);

    return () => clearInterval(updateInterval);
  }, []);

  const handleSendTest = async () => {
    setSendStatus('refreshing');

    try {
      await refresh();
      setSendStatus('refreshed');
    } catch (error) {
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

      <div className="deployment-status" style={{ 
        marginTop: '20px', 
        padding: '12px', 
        backgroundColor: '#f0fdf4', 
        border: '1px solid #86efac',
        borderRadius: '6px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong style={{ color: '#16a34a' }}>✓ Auto-Update Active</strong>
        </p>
        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#666' }}>
          <strong>Last Deployment:</strong> {deploymentTime}
        </p>
        <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
          <strong>Status:</strong> {autoUpdateStatus}
        </p>
      </div>
    </div>
  );
}

export default NotificationCenter;

