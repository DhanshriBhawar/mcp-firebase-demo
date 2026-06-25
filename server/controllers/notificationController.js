import admin from '../config/firebaseAdmin.js';
import { readTokens, writeTokens } from '../utils/tokenStore.js';

export const saveToken = async (req, res) => {
  const token = req.body.token ? String(req.body.token).trim() : null;
  const browser = req.body.browser ? String(req.body.browser).trim() : null;
  const platform = req.body.platform ? String(req.body.platform).trim() : null;

  if (!token) {
    return res.status(400).json({ success: false, error: 'token is required.' });
  }

  const now = new Date().toISOString();
  const tokens = await readTokens();
  let record = tokens.find((item) => item.token === token);

  if (record) {
    record.browser = browser || record.browser;
    record.platform = platform || record.platform;
    record.updatedAt = now;
  } else {
    record = {
      token,
      browser: browser || null,
      platform: platform || null,
      createdAt: now,
      updatedAt: now,
    };
    tokens.push(record);
  }

  await writeTokens(tokens);
  console.log('Token stored:', token.slice(0, 20) + '...');

  return res.json({ success: true, totalTokens: tokens.length });
};

export const getStatus = async (req, res) => {
  const tokens = await readTokens();
  return res.json({ success: true, totalTokens: tokens.length });
};

export const sendPush = async (req, res) => {
  const token = req.body.token ? String(req.body.token).trim() : null;
  const title = req.body.title ? String(req.body.title).trim() : null;
  const body = req.body.body ? String(req.body.body).trim() : null;

  if (!token || !title || !body) {
    return res.status(400).json({ success: false, error: 'token, title, and body are required.' });
  }

  try {
    console.log('Sending Push to token:', token.slice(0, 20) + '...');
    await admin.messaging().send({
      token,
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
