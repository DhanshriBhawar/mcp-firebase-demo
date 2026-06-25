import { logInfo, logError } from './loggingService.js';
import { fetchWithTimeout } from '../utils/fetchWithTimeout.js';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required to save token mappings.');
}

const API_SAVE_TOKEN = `${apiBaseUrl.replace(/\/+$/, '')}/api/save-token`;
const DEFAULT_TIMEOUT_MS = 10000;

export const saveTokenMapping = async ({ anonymousId, token }) => {
  if (!anonymousId) {
    throw new Error('anonymousId is required to save token metadata.');
  }

  if (!token) {
    throw new Error('token is required to save token metadata.');
  }

  const payload = {
    anonymousId,
    token,
    browser: navigator.userAgent || null,
    userAgent: navigator.userAgent || null,
    platform: navigator.platform || null,
    timestamp: new Date().toISOString(),
  };

  logInfo('Saving token mapping to backend.', payload);

  const response = await fetchWithTimeout(API_SAVE_TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, DEFAULT_TIMEOUT_MS);

  const result = await response.json();

  if (!response.ok || !result.success) {
    logError('Failed to save token mapping.', result);
    throw new Error(result.error || 'Failed to save token mapping.');
  }

  logInfo('Token mapping saved successfully.', result);
  return result;
};
