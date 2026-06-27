'use client'

import { useState } from 'react'

const QUERIES = {
  noFilter: {
    label:       'Without Date Filter — All Partitions Scanned',
    sql:         `EXPLAIN ANALYZE\nSELECT product_id, qty_change, created_at\nFROM inventory_logs\nWHERE qty_change > 0\nLIMIT 100`,
    description: 'Scans ALL monthly partitions — slow on large datasets',
    color:       'red',
  },
  withFilter: {
    label:       'With Date Filter — Partition Pruning Active',
    sql:         `EXPLAIN ANALYZE\nSELECT product_id, qty_change, created_at\nFROM inventory_logs\nWHERE created_at >= NOW() - INTERVAL '30 days'\n  AND qty_change > 0`,
    description: 'Only scans recent partitions — fast even with millions of rows',
    color:       'green',
  },
}

export default function ExplainPage() {
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)

  async function runExplain(key: string, sql: string) {
    setLoading(key)
    try {
      const res  = await fetch('/api/db/explain', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sql }),
      })
      const data = await res.json()
      setResults(prev => ({ ...prev, [key]: data.plan || data.error || 'No result' }))
    } catch {
      setResults(prev => ({ ...prev, [key]: 'Failed to execute query' }))
    }
    setLoading(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <a href="/dashboard/db-info" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-5 block transition">
        ← Back to DB Concepts
      </a>

      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">
        EXPLAIN ANALYZE — Partition Pruning Demo
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Run both queries and compare the query plans to prove partition pruning is working.
      </p>

      <div className="space-y-5">
        {Object.entries(QUERIES).map(([key, q]) => {
          const isGreen = q.color === 'green'
          return (
            <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Card header */}
              <div className={`px-5 py-3 border-b border-slate-100 flex items-center justify-between ${
                isGreen ? 'bg-emerald-50' : 'bg-red-50'
              }`}>
                <div>
                  <p className={`font-semibold text-sm ${isGreen ? 'text-emerald-900' : 'text-red-900'}`}>
                    {q.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isGreen ? 'text-emerald-700' : 'text-red-700'}`}>
                    {q.description}
                  </p>
                </div>
                <button
                  onClick={() => runExplain(key, q.sql)}
                  disabled={loading === key}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    isGreen
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600    hover:bg-red-700'
                  }`}
                >
                  {loading === key ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running…
                    </>
                  ) : 'Run Query'}
                </button>
              </div>

              {/* SQL */}
              <div className="p-5">
                <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">SQL Query</p>
                <pre className="bg-slate-900 text-blue-400 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap mb-4">
                  {q.sql}
                </pre>

                {/* Result */}
                {results[key] && (
                  <>
                    <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">
                      Query Plan Output
                    </p>
                    <pre className={`rounded-lg p-4 text-xs font-mono whitespace-pre-wrap border ${
                      isGreen
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-red-950    text-red-300    border-red-800'
                    }`}>
                      {results[key]}
                    </pre>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}