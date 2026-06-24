import admin from '../config/firebaseAdmin.js';

let savedToken = '';

export const saveToken = async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid token is required.' });
  }

  savedToken = token;
  console.log('FCM Token:', savedToken);

  return res.json({ success: true, message: 'Token Saved' });
};

export const getStatus = (req, res) => {
  return res.json({ success: true, tokenExists: savedToken !== '', token: savedToken });
};

export const sendPush = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ success: false, error: 'Title and body are required.' });
  }

  if (!savedToken) {
    return res.status(400).json({ success: false, error: 'No saved token available. Please enable notifications first.' });
  }

  try {
    console.log('Sending Push');
    await admin.messaging().send({
      token: savedToken,
      notification: {
        title,
        body,
      },
    });

    console.log('Push Sent');
    return res.json({ success: true, message: 'Push Sent Successfully' });
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return res.status(500).json({ success: false, error: 'Failed to send push notification.' });
  }
};
