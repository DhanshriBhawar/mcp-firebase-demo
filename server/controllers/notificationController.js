import admin from '../config/firebaseAdmin.js';
import { readTokens, writeTokens } from '../utils/tokenStore.js';

export const saveToken = async (req, res) => {
  const anonymousId = req.body.anonymousId ? String(req.body.anonymousId).trim() : null;
  const token = req.body.token ? String(req.body.token).trim() : null;
  const browser = req.body.browser ? String(req.body.browser).trim() : null;
  const userAgent = req.body.userAgent ? String(req.body.userAgent).trim() : null;
  const platform = req.body.platform ? String(req.body.platform).trim() : null;
  const timestamp = req.body.timestamp ? String(req.body.timestamp).trim() : null;

  if (!anonymousId || !token) {
    return res.status(400).json({ success: false, error: 'anonymousId and token are required.' });
  }

  const now = new Date().toISOString();
  const tokens = await readTokens();
  let record = tokens.find((item) => item.token === token || item.anonymousId === anonymousId);

  if (record) {
    record.anonymousId = anonymousId;
    record.token = token;
    record.browser = browser || record.browser;
    record.userAgent = userAgent || record.userAgent;
    record.platform = platform || record.platform;
    record.timestamp = timestamp || record.timestamp || now;
    record.updatedAt = now;
  } else {
    record = {
      anonymousId,
      token,
      browser: browser || null,
      userAgent: userAgent || null,
      platform: platform || null,
      timestamp: timestamp || now,
      createdAt: now,
      updatedAt: now,
    };
    tokens.push(record);
  }

  await writeTokens(tokens);
  console.log('Token mapping saved:', anonymousId, token.slice(0, 20) + '...');

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
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    console.log('Sending Push to token:', token.slice(0, 20) + '...');
    console.log('Firebase message payload:', JSON.stringify(message, null, 2));

    const response = await admin.messaging().send(message);

    console.log('========== FIREBASE RESPONSE ==========');
    console.log(response);

    return res.json({
      success: true,
      firebaseResponse: response,
    });
  } catch (error) {
    console.error('========== FIREBASE ERROR ==========');
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
      details: error,
    });
  }
};
