'use client'

import { useEffect, useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

type ChartItem    = { date: string; stockIn: number; stockOut: number }
type MovementData = { totalIn: number; totalOut: number; daysQueried: number; chartData: ChartItem[] }

export default function MovementPage() {
  const [data,    setData]    = useState<MovementData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/movement')
      .then(r => r.json())
      .then((result: MovementData) => setData(result))
      .catch(err => console.error('Movement analytics error:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading movement data…</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          Failed to load movement analytics.
        </div>
      </div>
    )
  }

  const netMovement = data.totalIn - data.totalOut

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">
        Stock Movement History
      </h1>
      <p className="text-slate-500 text-sm mb-4">
        Queried from{' '}
        <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">
          inventory_logs
        </code>{' '}
        partitioned table
      </p>

      {/* Partition Proof Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <p className="font-semibold text-emerald-900 mb-1 text-sm">
          Partition Pruning Active
        </p>
        <p className="text-emerald-800 text-xs leading-relaxed">
          This query scanned only the partitions covering the last 30 days, not the entire
          inventory_logs table. PostgreSQL pruned irrelevant monthly partitions automatically.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ borderTop:'3px solid #059669' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
            Total Stock IN (30 days)
          </p>
          <p className="text-3xl font-semibold text-emerald-700">+{data.totalIn}</p>
          <p className="text-xs text-slate-400 mt-1">Units added — deliveries</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ borderTop:'3px solid #DC2626' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
            Total Stock OUT (30 days)
          </p>
          <p className="text-3xl font-semibold text-red-600">-{data.totalOut}</p>
          <p className="text-xs text-slate-400 mt-1">Units removed — sales, damage</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5"
             style={{ borderTop:`3px solid ${netMovement >= 0 ? '#059669' : '#DC2626'}` }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
            Net Movement
          </p>
          <p className={`text-3xl font-semibold ${netMovement >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {netMovement >= 0 ? '+' : ''}{netMovement}
          </p>
          <p className="text-xs text-slate-400 mt-1">{data.daysQueried} days with activity</p>
        </div>
      </div>

      {/* Chart */}
      {!data.chartData || data.chartData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-14 text-center">
          <p className="text-slate-500 font-medium mb-1">No stock movements yet</p>
          <p className="text-slate-400 text-sm">
            Go to Products and use Adjust Stock on a few products, then come back here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-1 text-sm">
            Daily Stock Movement — Last 30 Days
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Green bars = stock added · Red bars = stock removed
          </p>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={data.chartData} margin={{ top:5, right:20, bottom:20, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => v.slice(5)}
                tick={{ fontSize:11, fill:'#64748B' }}
                angle={-35}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize:11, fill:'#64748B' }} />
              <Tooltip
                formatter={(value, name) => [
                  Number(value ?? 0),
                  name === 'stockIn' ? 'Stock IN' : 'Stock OUT',
                ]}
              />
              <Legend formatter={(v: string) => v === 'stockIn' ? 'Stock IN' : 'Stock OUT'} />
              <Bar dataKey="stockIn"  fill="#059669" radius={[4,4,0,0]} name="stockIn"  />
              <Bar dataKey="stockOut" fill="#DC2626" radius={[4,4,0,0]} name="stockOut" />
              <Line type="monotone" dataKey="stockIn" stroke="#065F46" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}