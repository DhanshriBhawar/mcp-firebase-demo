import { logInfo, logWarn } from './loggingService.js';

const candidateKeyNames = [
  'anonymousId',
  'anonymousid',
  'visitorId',
  'visitorid',
  'visitor',
  'id',
  'uuid',
  'uid',
];

const isValidId = (value) => typeof value === 'string' && value.trim().length > 8;

const scanObjectForAnonymousId = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 4) {
    return null;
  }

  for (const key of candidateKeyNames) {
    const value = obj[key];
    if (isValidId(value)) {
      return value.trim();
    }
  }

  for (const value of Object.values(obj)) {
    if (typeof value === 'object') {
      const nested = scanObjectForAnonymousId(value, depth + 1);
      if (isValidId(nested)) {
        return nested;
      }
    }
  }

  return null;
};

const readWindowSources = () => {
  const candidates = [
    window.c360aData,
    window.c360a,
    window.Evergage,
    window.evergage,
    window['c360a'],
    window['c360aData'],
  ];

  for (const candidate of candidates) {
    const result = scanObjectForAnonymousId(candidate);
    if (isValidId(result)) {
      return result;
    }
  }

  return null;
};

export const findMcpAnonymousId = () => {
  const anonymousId = readWindowSources();
  if (anonymousId) {
    logInfo('Found MCP anonymousId in global data.');
    return anonymousId;
  }

  return null;
};

export const waitForMcpAnonymousId = async ({ intervalMs = 500, timeoutMs = 30000 } = {}) => {
  const startTime = Date.now();
  logInfo('Waiting for MCP anonymousId to initialize...');

  while (Date.now() - startTime < timeoutMs) {
    const anonymousId = findMcpAnonymousId();
    if (anonymousId) {
      return anonymousId;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  logWarn('MCP anonymousId was not available within timeout.');
  throw new Error('MCP anonymousId not found within timeout.');
};
