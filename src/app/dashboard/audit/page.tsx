'use client'

import { useEffect, useState, useCallback } from 'react'

type AuditLog = {
  id: string
  action: string
  table_name: string
  record_id: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [table, setTable] = useState('')
  const [action, setAction] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams({
      limit: '100',
    })

    if (table) params.set('table', table)
    if (action) params.set('action', action)

    const res = await fetch(`/api/audit?${params}`)
    const data = await res.json()

    setLogs(data.logs || [])
  }, [table, action])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  function diffValues(
    oldV: Record<string, unknown> | null,
    newV: Record<string, unknown> | null
  ) {
    if (!oldV || !newV) return null

    const changed: string[] = []

    Object.keys(newV).forEach((key) => {
      if (key === 'updated_at') return

      if (
        JSON.stringify(oldV[key]) !==
        JSON.stringify(newV[key])
      ) {
        changed.push(
          `${key}: ${String(oldV[key])} → ${String(
            newV[key]
          )}`
        )
      }
    })

    return changed
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Audit Log
      </h1>

      <p className="text-slate-400 mb-6">
        Complete history of all database changes
      </p>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Tables</option>
          <option value="products">Products</option>
          <option value="purchase_orders">
            Purchase Orders
          </option>
        </select>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>

        <span className="ml-auto text-sm text-slate-400 self-center">
          {logs.length} entries
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                'Action',
                'Table',
                'Record ID',
                'Changed At',
                'Changes',
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold text-slate-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  No audit logs yet. Edit a product to
                  generate your first entry.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const diff = diffValues(
                  log.old_data,
                  log.new_data
                )

                return (
                  <tr
                    key={log.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-bold ${
                          ACTION_COLORS[log.action] || ''
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {log.table_name}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {log.record_id?.slice(0, 8)}...
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {diff && diff.length > 0 ? (
                        <>
                          <button
                            onClick={() =>
                              setExpanded(
                                expanded === log.id
                                  ? null
                                  : log.id
                              )
                            }
                            className="text-blue-600 text-xs hover:underline"
                          >
                            {expanded === log.id
                              ? 'Hide'
                              : 'Show'}{' '}
                            {diff.length} change(s)
                          </button>

                          {expanded === log.id && (
                            <div className="mt-2 bg-slate-50 rounded p-2 space-y-1">
                              {diff.map(
                                (change, index) => (
                                  <p
                                    key={index}
                                    className="text-xs font-mono text-slate-600"
                                  >
                                    {change}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </>
                      ) : log.action === 'INSERT' ? (
                        <span className="text-green-600 text-xs">
                          New record created
                        </span>
                      ) : log.action === 'DELETE' ? (
                        <span className="text-red-600 text-xs">
                          Record deleted
                        </span>
                      ) : null}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}