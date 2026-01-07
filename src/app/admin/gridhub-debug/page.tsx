'use client'

import { useEffect, useState, useRef } from 'react'
import { Copy, Check, Trash, RefreshCw, Filter, X } from '@phosphor-icons/react'

interface GridHubLog {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data: any
  context: any
  created_at: string
}

export default function GridHubDebugPage() {
  const [logs, setLogs] = useState<GridHubLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/gridhub-logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setError(null)
      } else {
        setError('Fout bij ophalen logs')
      }
    } catch (err) {
      setError('Fout bij ophalen logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()

    // Auto-refresh elke 5 seconden
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs()
      }, 5000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh])

  const copyAllLogs = async () => {
    try {
      const filteredLogs = getFilteredLogs()
      const logsText = JSON.stringify(filteredLogs, null, 2)
      await navigator.clipboard.writeText(logsText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy logs:', err)
    }
  }

  const copySingleLog = async (log: GridHubLog) => {
    try {
      const logText = JSON.stringify(log, null, 2)
      await navigator.clipboard.writeText(logText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy log:', err)
    }
  }

  const clearLogs = async () => {
    if (!confirm('Weet je zeker dat je alle logs wilt verwijderen?')) {
      return
    }

    try {
      // TODO: Implementeer delete endpoint als nodig
      // Voor nu: gewoon refresh
      await fetchLogs()
    } catch (err) {
      console.error('Failed to clear logs:', err)
    }
  }

  const getFilteredLogs = () => {
    let filtered = logs

    // Filter op level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel)
    }

    // Filter op search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search) ||
        JSON.stringify(log.data).toLowerCase().includes(search) ||
        JSON.stringify(log.context).toLowerCase().includes(search)
      )
    }

    return filtered
  }

  const filteredLogs = getFilteredLogs()

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">GridHub logs laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GridHub Debug Logs</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Uitgebreide logging van alle GridHub API calls en CapTar code debugging
                  {logs.length > 0 && ` (${filteredLogs.length} van ${logs.length} logs)`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    autoRefresh
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <RefreshCw size={20} weight={autoRefresh ? 'fill' : 'regular'} />
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={fetchLogs}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal-500 text-white rounded-lg hover:bg-brand-teal-600 transition-colors"
                >
                  <RefreshCw size={20} />
                  Refresh
                </button>
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
                      Kopieer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Alle levels</option>
                  <option value="error">Errors</option>
                  <option value="warn">Warnings</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Zoek in logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">Error loading logs: {error}</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800">
                  {logs.length === 0 
                    ? 'Geen logs gevonden. Maak een GridHub API call om logs te genereren.'
                    : 'Geen logs gevonden met de huidige filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`border-2 rounded-lg p-4 ${
                      log.level === 'error'
                        ? 'bg-red-50 border-red-200'
                        : log.level === 'warn'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString('nl-NL')}
                        </span>
                      </div>
                      <button
                        onClick={() => copySingleLog(log)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Kopieer deze log"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="mb-2">
                      <p className="font-medium text-gray-900">{log.message}</p>
                    </div>
                    {log.data && Object.keys(log.data).length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Data:</p>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.context && Object.keys(log.context).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Context:</p>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

