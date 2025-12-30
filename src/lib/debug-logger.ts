/**
 * Client-side debug logger dat logs naar de server stuurt
 * Gebruikt voor mobiele debugging waar we geen console hebben
 */

type LogLevel = 'info' | 'warn' | 'error'

interface LogData {
  level: LogLevel
  message: string
  data?: any
  url?: string
  userAgent?: string
  timestamp?: string
}

/**
 * Stuurt een log naar de server voor opslag
 */
export async function sendDebugLog(level: LogLevel, message: string, data?: any) {
  try {
    const logData: LogData = {
      level,
      message,
      data: data || {},
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      timestamp: new Date().toISOString(),
    }

    // Ook naar console voor ontwikkeling
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    consoleMethod(`[DEBUG ${level.toUpperCase()}]`, message, data)

    // Stuur naar server (non-blocking, falen is niet erg)
    fetch('/api/debug-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    }).catch((err) => {
      console.error('❌ Failed to send debug log:', err)
    })
  } catch (err) {
    console.error('❌ Error in sendDebugLog:', err)
  }
}

/**
 * Helper functies voor verschillende log levels
 */
export const debugLogger = {
  info: (message: string, data?: any) => sendDebugLog('info', message, data),
  warn: (message: string, data?: any) => sendDebugLog('warn', message, data),
  error: (message: string, data?: any) => sendDebugLog('error', message, data),
}

