/**
 * GridHub Logger
 * 
 * Centralized logging for GridHub API calls that stores logs in database
 * for viewing in admin debug page
 */

interface LogData {
  [key: string]: any
}

interface LogContext {
  aanvraagId?: string
  aanvraagnummer?: string
  hasGas?: boolean
  hasElectricity?: boolean
  capacityCodeGas?: string
  capacityCodeElectricity?: string
  [key: string]: any
}

/**
 * Log a message to both console and database
 */
export async function logGridHub(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: LogData,
  context?: LogContext
) {
  // Always log to console
  const timestamp = new Date().toISOString()
  const logPrefix = `[${timestamp}] [GridHub]`
  
  switch (level) {
    case 'error':
      console.error(logPrefix, message, data || '')
      break
    case 'warn':
      console.warn(logPrefix, message, data || '')
      break
    case 'debug':
      console.log(logPrefix, message, data || '')
      break
    default:
      console.log(logPrefix, message, data || '')
  }

  // Try to save to database (non-blocking, don't fail if it doesn't work)
  try {
    // Use fetch to save log (works in both server and client contexts)
    await fetch('/api/admin/gridhub-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        message,
        data: data || {},
        context: context || {},
      }),
    }).catch(() => {
      // Silently fail - logging should never break the app
    })
  } catch (error) {
    // Silently fail - logging should never break the app
  }
}

/**
 * Convenience functions
 */
export const gridHubLogger = {
  info: (message: string, data?: LogData, context?: LogContext) =>
    logGridHub('info', message, data, context),
  warn: (message: string, data?: LogData, context?: LogContext) =>
    logGridHub('warn', message, data, context),
  error: (message: string, data?: LogData, context?: LogContext) =>
    logGridHub('error', message, data, context),
  debug: (message: string, data?: LogData, context?: LogContext) =>
    logGridHub('debug', message, data, context),
}

