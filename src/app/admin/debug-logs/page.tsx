'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check } from '@phosphor-icons/react'

/**
 * Admin pagina om debug logs te bekijken
 * Toegankelijk via /admin/debug-logs
 */
export default function DebugLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/debug-logs')
        if (response.ok) {
          const data = await response.json()
          setLogs(data.logs || [])
        } else {
          setError('Fout bij ophalen logs')
        }
      } catch (err) {
        setError('Fout bij ophalen logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const copyAllLogs = async () => {
    try {
      const logsText = JSON.stringify(logs, null, 2)
      await navigator.clipboard.writeText(logsText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy logs:', err)
    }
  }

  const copySingleLog = async (log: any) => {
    try {
      const logText = JSON.stringify(log, null, 2)
      await navigator.clipboard.writeText(logText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy log:', err)
    }
  }

  if (error) {
    console.error('Error fetching logs:', error)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Logs laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Debug Logs</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Laatste {logs.length} logs van client-side components (vooral voor mobiele debugging)
                </p>
              </div>
              <button
                onClick={copyAllLogs}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal-500 text-white rounded-lg hover:bg-brand-teal-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={20} weight="bold" />
                    Gekopieerd!
                  </>
                ) : (
                  <>
                    <Copy size={20} weight="bold" />
                    Kopieer alle logs
                  </>
                )}
              </button>
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">Error loading logs: {error}</p>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
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
                        <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs" title={log.url}>{log.url}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                            {JSON.stringify(log.data || {}, null, 2)}
                          </pre>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => copySingleLog(log)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Kopieer deze log"
                          >
                            <Copy size={14} />
                            Kopieer
                          </button>
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

