'use client'

import { useState } from 'react'

const QUERIES = {
  noFilter: {
    label: 'Without Date Filter (All Partitions Scanned)',
    sql: `EXPLAIN ANALYZE
SELECT product_id, qty_change, created_at
FROM inventory_logs
WHERE qty_change > 0
LIMIT 100`,
    description:
      'Scans ALL monthly partitions — slow on large datasets',
    color: 'red',
  },

  withFilter: {
    label: 'With Date Filter (Partition Pruning Active)',
    sql: `EXPLAIN ANALYZE
SELECT product_id, qty_change, created_at
FROM inventory_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND qty_change > 0`,
    description:
      'Only scans recent partitions — fast even with millions of rows',
    color: 'green',
  },
}

export default function ExplainPage() {
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)

  async function runExplain(key: string, sql: string) {
    setLoading(key)

    try {
      const res = await fetch('/api/db/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      })

      const data = await res.json()

      setResults(prev => ({
        ...prev,
        [key]: data.plan || data.error || 'No result',
      }))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [key]: 'Failed to execute query',
      }))
    }

    setLoading(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <a
        href="/dashboard/db-info"
        className="text-teal-600 text-sm mb-4 block"
      >
        ← Back to DB Concepts
      </a>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        EXPLAIN ANALYZE — Partition Pruning Demo
      </h1>

      <p className="text-slate-500 mb-8">
        Run both queries and compare the query plans to prove partition
        pruning is working.
      </p>

      <div className="space-y-6">
        {Object.entries(QUERIES).map(([key, q]) => (
          <div
            key={key}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {q.label}
                </h2>

                <p
                  className={`text-sm mt-1 ${
                    q.color === 'red'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {q.description}
                </p>
              </div>

              <button
                onClick={() => runExplain(key, q.sql)}
                disabled={loading === key}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  q.color === 'red'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {loading === key ? 'Running...' : 'Run Query'}
              </button>
            </div>

            <pre className="bg-slate-900 text-blue-400 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap mb-3">
              {q.sql}
            </pre>

            {results[key] && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1 font-semibold">
                  QUERY PLAN OUTPUT:
                </p>

                <pre
                  className={`rounded-lg p-4 text-xs font-mono whitespace-pre-wrap border-2 ${
                    q.color === 'green'
                      ? 'bg-green-950 text-green-300 border-green-700'
                      : 'bg-red-950 text-red-300 border-red-700'
                  }`}
                >
                  {results[key]}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}