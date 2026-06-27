'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#059669','#0891B2','#7C3AED','#D97706','#DC2626','#0F766E','#9D174D','#92400E']

const currency = (value: number) => `Rs. ${value.toLocaleString()}`

type TopProduct   = { name: string; value: number }
type CategoryData = { name: string; count: number }
type LowStockItem = { name: string; qty: number; reorder: number }

type AnalyticsData = {
  topByValue: TopProduct[]
  byCategory: CategoryData[]
  lowStock:   LowStockItem[]
  stats: {
    totalValue:    number
    totalProducts: number
    lowStockCount: number
    outOfStock:    number
  }
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/charts')
      .then(r => r.json())
      .then((result: AnalyticsData) => setData(result))
      .catch(err => console.error('Analytics error:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading analytics…</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          Failed to load analytics data.
        </div>
      </div>
    )
  }

  const { topByValue, byCategory, lowStock, stats } = data

  const statCards = [
    { label:'Total Inventory Value', value:`Rs. ${Math.round(stats.totalValue).toLocaleString()}`, color:'text-emerald-700', border:'#059669' },
    { label:'Total Products',        value: stats.totalProducts,                                   color:'text-slate-900',   border:'#6366F1' },
    { label:'Low Stock Alerts',      value: stats.lowStockCount,                                   color:'text-amber-700',   border:'#D97706' },
    { label:'Out of Stock',          value: stats.outOfStock,                                      color:'text-red-700',     border:'#DC2626' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">Analytics</h1>
      <p className="text-slate-500 text-sm mb-6">Aggregated from your inventory database</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
            style={{ borderTop: `3px solid ${card.border}` }}
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
              {card.label}
            </p>
            <p className={`text-3xl font-semibold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Top Products Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-0.5">Top Products by Inventory Value</h2>
          <p className="text-xs text-slate-400 mb-4">unit_price × quantity_on_hand</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topByValue} layout="vertical" margin={{ left:0, right:20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`}
                tick={{ fontSize:11, fill:'#64748B' }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize:10, fill:'#64748B' }}
              />
              <Tooltip formatter={(value) => currency(Number(value ?? 0))} />
              <Bar dataKey="value" fill="#059669" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-0.5">Products by Category</h2>
          <p className="text-xs text-slate-400 mb-4">Distribution across all categories</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {byCategory.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Table */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100" style={{ borderTop:'3px solid #DC2626' }}>
            <h2 className="font-semibold text-slate-900 text-sm">
              Low Stock Alert
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {lowStock.length} product{lowStock.length !== 1 ? 's' : ''} need restocking
              </span>
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Product','Current Qty','Reorder Point','Urgency'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStock.map((product, i) => {
                const pct      = product.reorder > 0 ? product.qty / product.reorder : 0
                const urgency  = product.qty === 0 ? 'CRITICAL — Out of Stock'
                              : pct < 0.3           ? 'HIGH — Order Immediately'
                              :                       'MEDIUM — Order Soon'
                const urgCls   = product.qty === 0 ? 'bg-red-100 text-red-700'
                              : pct < 0.3           ? 'bg-amber-100 text-amber-700'
                              :                       'bg-yellow-100 text-yellow-700'
                return (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{product.qty}</td>
                    <td className="px-4 py-3 text-slate-500">{product.reorder}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${urgCls}`}>
                        {urgency}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}