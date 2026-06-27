'use client'

import { useEffect, useState } from 'react'
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts'

type Stats = {
  totalProducts: number
  totalValue:    number
  lowStockCount: number
}

export default function LiveDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalValue:    0,
    lowStockCount: 0,
  })

  const { recentUpdates, connected } = useRealtimeProducts()

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/analytics/summary')
        if (!res.ok) return
        const data = await res.json()
        setStats({
          totalProducts: data.totalProducts ?? 0,
          totalValue:    data.totalValue    ?? 0,
          lowStockCount: data.lowStockCount ?? 0,
        })
      } catch (error) {
        console.error('Failed to load analytics:', error)
      }
    }
    void loadStats()
  }, [recentUpdates])

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time overview of your stock
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50  text-amber-700  border-amber-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          {connected ? 'Live Updates Active' : 'Connecting…'}
        </div>
      </div>

      {/* ── Stats ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Total Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5"
             style={{ borderTop: '3px solid #059669' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
            Total Products
          </p>
          <p className="text-4xl font-semibold text-slate-900">
            {stats.totalProducts}
          </p>
          <p className="text-xs text-slate-400 mt-1">Across all categories</p>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-5"
             style={{ borderTop: '3px solid #059669' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
            Total Inventory Value
          </p>
          <p className="text-4xl font-semibold text-emerald-700">
            Rs. {stats.totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">unit_price × qty</p>
        </div>

        {/* Low Stock */}
        <div
          className={`rounded-xl border p-5 ${
            stats.lowStockCount > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-slate-200'
          }`}
          style={{
            borderTop: `3px solid ${stats.lowStockCount > 0 ? '#EF4444' : '#059669'}`,
          }}
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
            Low Stock Alerts
          </p>
          <p
            className={`text-4xl font-semibold ${
              stats.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {stats.lowStockCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.lowStockCount > 0 ? 'Needs reorder' : 'All levels healthy'}
          </p>
        </div>
      </div>

      {/* ── Activity Feed ──────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              Live Stock Activity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by Supabase Realtime WebSocket
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Updates appear instantly
          </span>
        </div>

        {recentUpdates.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-slate-400 text-lg">📦</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">No activity yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Adjust stock on any product — it will appear here live
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentUpdates.map(update => (
              <div
                key={`${update.productId}-${update.timestamp}`}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    update.changeQty > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {update.changeQty > 0 ? '+' : '−'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">
                    Stock adjusted:{' '}
                    <span
                      className={
                        update.changeQty > 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }
                    >
                      {update.changeQty > 0 ? '+' : ''}
                      {update.changeQty} units
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    New quantity: {update.newQty}
                  </p>
                </div>

                <p className="text-xs text-slate-400 flex-shrink-0">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}