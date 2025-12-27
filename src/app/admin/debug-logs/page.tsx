import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Admin pagina om debug logs te bekijken
 * Toegankelijk via /admin/debug-logs
 */
export default async function DebugLogsPage() {
  const supabase = await createClient()

  // Check if user is admin (simplified - you might want to add proper auth check)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin/login')
  }

  // Fetch latest logs (last 100)
  const { data: logs, error } = await supabase
    .from('debug_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching logs:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug Logs</h1>
            <p className="text-sm text-gray-600 mb-6">
              Laatste 100 logs van client-side components (vooral voor mobiele debugging)
            </p>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">Error loading logs: {error.message}</p>
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800">Geen logs gevonden. Test de contract viewer op mobiel om logs te genereren.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tijd</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log: any) => (
                      <tr key={log.id} className={log.level === 'error' ? 'bg-red-50' : log.level === 'warn' ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('nl-NL')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            log.level === 'error' ? 'bg-red-100 text-red-800' :
                            log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                            log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.message}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{log.url}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                            {JSON.stringify(log.data || {}, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

