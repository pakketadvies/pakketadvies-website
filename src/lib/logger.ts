/**
 * Logger utility for development and production
 * Only logs in development, except for errors which are always logged
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Log info messages (only in development)
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Log errors (always logged, even in production)
   */
  error: (...args: unknown[]) => {
    console.error(...args)
    // TODO: In production, send to error tracking service (e.g. Sentry)
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },

  /**
   * Log info with prefix (only in development)
   */
  info: (prefix: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[${prefix}]`, ...args)
    }
  },
}

export default logger

