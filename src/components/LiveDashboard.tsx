// src/components/LiveDashboard.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts'

type Stats = {
  totalProducts: number
  totalValue: number
  lowStockCount: number
}

export default function LiveDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
  })

  const { recentUpdates, connected } = useRealtimeProducts()

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/analytics/summary')

        if (!res.ok) {
          return
        }

        const data = await res.json()

        setStats({
          totalProducts: data.totalProducts ?? 0,
          totalValue: data.totalValue ?? 0,
          lowStockCount: data.lowStockCount ?? 0,
        })
      } catch (error) {
        console.error('Failed to load analytics:', error)
      }
    }

    void loadStats()
  }, [recentUpdates])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Inventory Dashboard
        </h1>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            connected
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              connected
                ? 'bg-green-500 animate-pulse'
                : 'bg-yellow-500'
            }`}
          />

          {connected
            ? 'Live Updates Active'
            : 'Connecting...'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
            Total Products
          </p>

          <p className="text-4xl font-bold text-slate-900">
            {stats.totalProducts}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
            Total Inventory Value
          </p>

          <p className="text-4xl font-bold text-slate-900">
            Rs. {stats.totalValue.toLocaleString()}
          </p>
        </div>

        <div
          className={`rounded-xl shadow-sm p-6 ${
            stats.lowStockCount > 0
              ? 'bg-red-50'
              : 'bg-white'
          }`}
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
            Low Stock Alerts
          </p>

          <p
            className={`text-4xl font-bold ${
              stats.lowStockCount > 0
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {stats.lowStockCount}
          </p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Live Stock Activity
          </h2>

          <span className="text-xs text-slate-400">
            Updates appear here instantly
          </span>
        </div>

        {recentUpdates.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <p>No activity yet.</p>

            <p className="text-sm mt-1">
              Adjust stock on any product — it will appear here live!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentUpdates.map((update) => (
              <div
                key={`${update.productId}-${update.timestamp}`}
                className="px-6 py-4 flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    update.changeQty > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {update.changeQty > 0 ? '+' : '-'}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    Stock adjusted:{' '}
                    {update.changeQty > 0 ? '+' : ''}
                    {update.changeQty} units
                  </p>

                  <p className="text-sm text-slate-400">
                    New quantity: {update.newQty}
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  {new Date(
                    update.timestamp
                  ).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}