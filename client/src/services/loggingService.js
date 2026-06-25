// Logging service for notification architecture

const LOG_PREFIX = '[NotificationArch]';

export const logInfo = (...args) => {
  console.log(LOG_PREFIX, ...args);
};

export const logWarn = (...args) => {
  console.warn(LOG_PREFIX, ...args);
};

export const logError = (...args) => {
  console.error(LOG_PREFIX, ...args);
};
