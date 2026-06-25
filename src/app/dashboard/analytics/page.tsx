'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const PIE_COLORS = [
  '#1D4ED8',
  '#6D28D9',
  '#0F766E',
  '#065F46',
  '#C2410C',
  '#9D174D',
  '#0E7490',
  '#92400E',
]

const currency = (value: number) =>
  `Rs. ${value.toLocaleString()}`

type TopProduct = {
  name: string
  value: number
}

type CategoryData = {
  name: string
  count: number
}

type LowStockItem = {
  name: string
  qty: number
  reorder: number
}

type AnalyticsData = {
  topByValue: TopProduct[]
  byCategory: CategoryData[]
  lowStock: LowStockItem[]
  stats: {
    totalValue: number
    totalProducts: number
    lowStockCount: number
    outOfStock: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/charts')
      .then((response) => response.json())
      .then((result: AnalyticsData) => {
        setData(result)
      })
      .catch((error) => {
        console.error('Analytics error:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-slate-400 animate-pulse">
          Loading analytics...
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Failed to load analytics data.
        </p>
      </div>
    )
  }

  const { topByValue, byCategory, lowStock, stats } = data

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Analytics
      </h1>

      <p className="text-slate-400 mb-8">
        Aggregated from your inventory database
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Inventory Value',
            value: `Rs. ${Math.round(
              stats.totalValue
            ).toLocaleString()}`,
            color: 'text-blue-700',
            bg: 'bg-blue-50',
          },
          {
            label: 'Total Products',
            value: stats.totalProducts,
            color: 'text-purple-700',
            bg: 'bg-purple-50',
          },
          {
            label: 'Low Stock Alerts',
            value: stats.lowStockCount,
            color: 'text-orange-700',
            bg: 'bg-orange-50',
          },
          {
            label: 'Out of Stock',
            value: stats.outOfStock,
            color: 'text-red-700',
            bg: 'bg-red-50',
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.bg} rounded-xl p-5`}
          >
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
              {item.label}
            </p>

            <p className={`text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-1">
            Top Products by Inventory Value
          </h2>

          <p className="text-xs text-slate-400 mb-4">
            unit_price × quantity_on_hand
          </p>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={topByValue}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                tickFormatter={(value: number) =>
  `${(value / 1000).toFixed(0)}k`
}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 10 }}
              />

              <Tooltip
  formatter={(value) =>
    currency(Number(value ?? 0))
  }
/>

              <Bar
                dataKey="value"
                fill="#1D4ED8"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-1">
            Products by Category
          </h2>

          <p className="text-xs text-slate-400 mb-4">
            Distribution across all categories
          </p>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({
  name,
  percent,
}: {
  name?: string
  percent?: number
}) =>
  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
}
                labelLine={false}
              >
                {byCategory.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      PIE_COLORS[
                        index % PIE_COLORS.length
                      ]
                    }
                  />
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-red-50">
            <h2 className="font-semibold text-red-900">
              Low Stock Alert — {lowStock.length} product
              {lowStock.length !== 1 ? 's' : ''} need
              restocking
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'Product',
                  'Current Qty',
                  'Reorder Point',
                  'Urgency',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-4 py-3 font-semibold text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {lowStock.map((product, index) => {
                const pct =
                  product.reorder > 0
                    ? product.qty / product.reorder
                    : 0

                const urgency =
                  product.qty === 0
                    ? 'CRITICAL — Out of Stock'
                    : pct < 0.3
                    ? 'HIGH — Order Immediately'
                    : 'MEDIUM — Order Soon'

                const urgencyColor =
                  product.qty === 0
                    ? 'bg-red-100 text-red-800'
                    : pct < 0.3
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'

                return (
                  <tr
                    key={index}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-medium">
                      {product.name}
                    </td>

                    <td className="px-4 py-3 font-bold text-red-600">
                      {product.qty}
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {product.reorder}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${urgencyColor}`}
                      >
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