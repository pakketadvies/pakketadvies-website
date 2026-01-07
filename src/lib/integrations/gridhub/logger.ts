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

  // Save to database (server-side only, non-blocking)
  try {
    // Only run on server-side (Next.js API routes)
    if (typeof window === 'undefined') {
      // Dynamically import Supabase to avoid issues
      const { createClient } = await import('@supabase/supabase-js')
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('[GridHub Logger] Supabase credentials not available, skipping database log')
        return
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Extract aanvraag_id from context
      const aanvraagId = context?.aanvraagId || null

      // Insert log directly into database
      await supabase
        .from('gridhub_logs')
        .insert({
          level: level || 'info',
          message: message || '',
          data: data || {},
          context: context || {},
          aanvraag_id: aanvraagId,
          created_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) {
            console.error('[GridHub Logger] Failed to save log to database:', error)
          }
        })
    }
  } catch (error) {
    // Silently fail - logging should never break the app
    console.error('[GridHub Logger] Error saving to database:', error)
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

