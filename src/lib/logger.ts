/**
 * Advanced Logger for Next.js Application
 *
 * Controls logging based on environment variables.
 * - In Development: Logs everything.
 * - In Production: Logs ONLY if NEXT_PUBLIC_ENABLE_LOGGING is 'true'.
 *
 * Features:
 * - Structured Output: Adds Timestamps and Levels.
 * - Error Safety: Always logs critical errors if not strictly silenced.
 */

const isDev = process.env.NODE_ENV === 'development';
const isLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';

// Helper to format timestamp
const getTimestamp = () => {
  return new Date().toISOString().split('T')[1].split('.')[0];
};

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const print = (level: LogLevel, ...args: any[]) => {
  // Determine if we should log
  // 1. If it's Dev, always log.
  // 2. If it's Prod, log ONLY IF explicitly enabled.
  const shouldLog = isDev || isLoggingEnabled;

  if (!shouldLog) return;

  const prefix = `[${level}] [${getTimestamp()}]`;

  // Enhance console visibility
  const styles = {
    INFO: 'color: #2563eb; font-weight: bold;', // Blue
    WARN: 'color: #d97706; font-weight: bold;', // Amber
    ERROR: 'color: #dc2626; font-weight: bold;', // Red
    DEBUG: 'color: #9333ea; font-weight: bold;', // Purple
  };

  // Use specific console methods for browser capabilities
  switch (level) {
    case 'ERROR':
      console.error(`%c${prefix}`, styles.ERROR, ...args);
      break;
    case 'WARN':
      console.warn(`%c${prefix}`, styles.WARN, ...args);
      break;
    case 'DEBUG':
      console.debug(`%c${prefix}`, styles.DEBUG, ...args);
      break;
    case 'INFO':
    default:
      console.log(`%c${prefix}`, styles.INFO, ...args);
      break;
  }
};

export const logger = {
  log: (...args: any[]) => print('INFO', ...args),
  info: (...args: any[]) => print('INFO', ...args),
  warn: (...args: any[]) => print('WARN', ...args),
  error: (...args: any[]) => {
    // Critical errors should ideally always be visible in Dev.
    // In Prod, we might still want to suppress them to avoid leaking info to users console
    // unless Debugging is ON.
    // Current Logic: Adhere to the master switch.
    print('ERROR', ...args);
  },
  debug: (...args: any[]) => print('DEBUG', ...args),
};
