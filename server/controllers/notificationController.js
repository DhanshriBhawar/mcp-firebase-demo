import admin from '../config/firebaseAdmin.js';
import { readTokens, writeTokens } from '../utils/tokenStore.js';

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

export const saveToken = async (req, res) => {
  const anonymousId = normalizeString(req.body.anonymousId);
  const token = normalizeString(req.body.token);
  const browser = normalizeString(req.body.browser);
  const platform = normalizeString(req.body.platform);

  if (!anonymousId || !token) {
    return res.status(400).json({ success: false, error: 'anonymousId and token are required.' });
  }

  const now = new Date().toISOString();
  const tokens = await readTokens();
  let changed = false;
  let record = tokens.find((item) => item.anonymousId === anonymousId);

  if (record) {
    record.token = token;
    record.browser = browser || record.browser;
    record.platform = platform || record.platform;
    record.updatedAt = now;
    changed = true;
  } else {
    record = tokens.find((item) => item.token === token);
    if (record) {
      record.anonymousId = anonymousId;
      record.browser = browser || record.browser;
      record.platform = platform || record.platform;
      record.updatedAt = now;
      changed = true;
    }
  }

  if (!record) {
    record = {
      anonymousId,
      email: null,
      customerId: null,
      token,
      browser: browser || null,
      platform: platform || null,
      createdAt: now,
      updatedAt: now,
    };
    tokens.push(record);
    changed = true;
  }

  if (changed) {
    await writeTokens(tokens);
    console.log('Token stored for anonymousId:', anonymousId);
  }

  return res.json({ success: true, totalVisitors: tokens.length });
};

export const getStatus = async (req, res) => {
  const tokens = await readTokens();
  return res.json({ success: true, totalVisitors: tokens.length });
};

export const sendPush = async (req, res) => {
  const anonymousId = normalizeString(req.body.anonymousId);
  const title = normalizeString(req.body.title);
  const body = normalizeString(req.body.body);

  if (!anonymousId || !title || !body) {
    return res.status(400).json({ success: false, error: 'anonymousId, title, and body are required.' });
  }

  const tokens = await readTokens();
  const record = tokens.find((item) => item.anonymousId === anonymousId);

  if (!record) {
    return res.status(404).json({ success: false, error: 'Visitor not found.' });
  }

  try {
    console.log('Sending Push to anonymousId:', anonymousId);
    await admin.messaging().send({
      token: record.token,
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
