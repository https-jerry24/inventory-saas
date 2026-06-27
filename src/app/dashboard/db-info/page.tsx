'use client'

import { useEffect, useState } from 'react'

type RLSPolicy  = { table_name: string; policy_name: string; operation: string; using_expression: string | null }
type Partition  = { partition_name: string; partition_range: string; partition_size: string }
type TableCount = { table_name: string; estimated_rows: number }
type RLSEnabled = { table_name: string; rls_enabled: boolean }

type DBInfoResponse = {
  rlsPolicies:  RLSPolicy[]
  partitions:   Partition[]
  tableCounts:  TableCount[]
  tenantCount:  number
  rlsEnabled:   RLSEnabled[]
  error?:       string
}

const OP_STYLES: Record<string, string> = {
  SELECT: 'bg-emerald-100 text-emerald-700',
  INSERT: 'bg-blue-100   text-blue-700',
  UPDATE: 'bg-amber-100  text-amber-700',
  DELETE: 'bg-red-100    text-red-700',
  ALL:    'bg-purple-100 text-purple-700',
}

function ConceptHeader({ color, label, badge }: { color: string; label: string; badge: string }) {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 ${color}`}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">{label}</p>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/60">
          {badge}
        </span>
      </div>
      <p className="text-xs mt-0.5 opacity-70">CONCEPT DEMONSTRATED</p>
    </div>
  )
}

export default function DBInfoPage() {
  const [data,    setData]    = useState<DBInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res    = await fetch('/api/db/info')
        const result = await res.json()
        setData(result)
      } catch {
        setData({ rlsPolicies:[], partitions:[], tableCounts:[], tenantCount:0, rlsEnabled:[], error:'Failed to load data' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-3 text-slate-500">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Querying PostgreSQL system tables…</span>
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          Error: {data?.error}
        </div>
      </div>
    )
  }

  const { rlsPolicies, partitions, tableCounts, tenantCount, rlsEnabled } = data
  const rlsEnabledCount = rlsEnabled.filter(t => t.rls_enabled).length

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">
        Database Concepts — Live Proof
      </h1>
      <p className="text-slate-500 text-sm mb-2">
        All data queried live from PostgreSQL system tables
      </p>
      <div className="flex items-center gap-2 mb-6">
        {['pg_policies','pg_inherits','pg_class','pg_stat_user_tables'].map(t => (
          <code key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{t}</code>
        ))}
      </div>

      {/* ── CONCEPT 1: RLS ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
        <ConceptHeader
          color="bg-emerald-50 text-emerald-900"
          label="Row-Level Security"
          badge={`${rlsPolicies.length} policies · ${rlsEnabledCount} tables protected`}
        />
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-3">
            Tenant isolation enforced at PostgreSQL engine level — not in application code
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Table','Policy Name','Operation','Expression'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rlsPolicies.map((p, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-mono text-slate-700">{p.table_name}</td>
                    <td className="px-3 py-2 text-slate-500">{p.policy_name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${OP_STYLES[p.operation] ?? ''}`}>
                        {p.operation}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-emerald-700">{p.using_expression}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CONCEPT 2: PARTITIONING ─────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
        <ConceptHeader
          color="bg-blue-50 text-blue-900"
          label="Table Partitioning"
          badge={`${partitions.length} monthly partitions`}
        />
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-3">
            <code className="font-mono bg-slate-100 px-1 rounded">inventory_logs</code> partitioned RANGE on{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">log_date</code> — partition pruning active on date-filtered queries
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {partitions.map((p, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="font-mono text-xs font-semibold text-slate-900 mb-1">{p.partition_name}</p>
                <p className="text-xs text-slate-500 mb-1">{p.partition_range}</p>
                <p className="text-xs text-slate-400">Size: {p.partition_size}</p>
              </div>
            ))}
            {partitions.length === 0 && (
              <p className="col-span-3 text-slate-400 text-sm">
                No partitions found — run the partition SQL from Week 1.
              </p>
            )}
          </div>
          <div className="mt-4">
            <a
              href="/dashboard/db-info/explain"
              className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition"
            >
              Run EXPLAIN ANALYZE Demo →
            </a>
          </div>
        </div>
      </div>

      {/* ── CONCEPT 3: MULTI-TENANCY ─────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
        <ConceptHeader
          color="bg-amber-50 text-amber-900"
          label="Multi-Tenancy Schema"
          badge={`${tenantCount} tenants · shared database`}
        />
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-3">
            All companies share one PostgreSQL database — isolated by{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">tenant_id</code> column + RLS
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Table','Estimated Rows','RLS Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableCounts.map((table, i) => {
                  const rls = rlsEnabled.find(r => r.table_name === table.table_name)
                  return (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{table.table_name}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">
                        {Number(table.estimated_rows).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          rls?.rls_enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100    text-red-700'
                        }`}>
                          {rls?.rls_enabled ? '✓ Protected' : '✗ No RLS'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CONCEPT 4: REPLICATION ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <ConceptHeader
          color="bg-purple-50 text-purple-900"
          label="Replication"
          badge="Supabase Streaming"
        />
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-4">
            Supabase automatic streaming replication — Primary handles writes, Read Replica handles analytics
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="font-semibold text-slate-900 text-sm">Primary Database</p>
              </div>
              <p className="text-xs text-slate-500 mb-2">Handles all WRITE operations</p>
              <code className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded block">
                INSERT / UPDATE / DELETE
              </code>
              <p className="text-xs text-slate-400 mt-2">Connected via: DATABASE_URL</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="font-semibold text-slate-900 text-sm">Read Replica</p>
              </div>
              <p className="text-xs text-slate-500 mb-2">Handles READ operations</p>
              <code className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded block">
                SELECT — analytics queries
              </code>
              <p className="text-xs text-slate-400 mt-2">Connected via: DIRECT_URL</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3">
            <p className="text-emerald-400 font-mono text-xs mb-1">-- Verify in Supabase SQL Editor:</p>
            <p className="text-blue-400 font-mono text-sm">SELECT * FROM pg_stat_replication;</p>
          </div>
        </div>
      </div>
    </div>
  )
}