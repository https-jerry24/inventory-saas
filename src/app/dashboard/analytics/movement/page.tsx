'use client'

import { useEffect, useState } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type ChartItem = {
  date: string
  stockIn: number
  stockOut: number
}

type MovementData = {
  totalIn: number
  totalOut: number
  daysQueried: number
  chartData: ChartItem[]
}

export default function MovementPage() {
  const [data, setData] = useState<MovementData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/movement')
      .then((response) => response.json())
      .then((result: MovementData) => {
        setData(result)
      })
      .catch((error) => {
        console.error('Movement analytics error:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading movement data...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 text-red-500">
        Failed to load movement analytics.
      </div>
    )
  }

  const netMovement = data.totalIn - data.totalOut

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Stock Movement History
      </h1>

      <p className="text-slate-400 mb-2">
        Queried from{' '}
        <code className="text-purple-700 font-mono">
          inventory_logs
        </code>{' '}
        partitioned table
      </p>

      {/* Partition Proof Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
        <p className="font-semibold text-purple-900 mb-1">
          Partition Pruning Active
        </p>

        <p className="text-purple-700 text-sm">
          This query scanned only the partitions covering the
          last 30 days, not the entire inventory_logs table.
          PostgreSQL pruned irrelevant monthly partitions
          automatically.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Total Stock IN (30 days)
          </p>

          <p className="text-3xl font-bold text-green-700">
            +{data.totalIn}
          </p>

          <p className="text-xs text-green-600 mt-1">
            Units added (deliveries)
          </p>
        </div>

        <div className="bg-red-50 rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Total Stock OUT (30 days)
          </p>

          <p className="text-3xl font-bold text-red-700">
            -{data.totalOut}
          </p>

          <p className="text-xs text-red-600 mt-1">
            Units removed (sales, damage)
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Net Movement
          </p>

          <p
            className={`text-3xl font-bold ${
              netMovement >= 0
                ? 'text-blue-700'
                : 'text-red-700'
            }`}
          >
            {netMovement >= 0 ? '+' : ''}
            {netMovement}
          </p>

          <p className="text-xs text-blue-600 mt-1">
            {data.daysQueried} days with activity
          </p>
        </div>
      </div>

      {/* Chart */}
      {!data.chartData || data.chartData.length === 0 ?  (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-400">
          <p className="text-lg font-medium mb-2">
            No stock movements yet
          </p>

          <p className="text-sm">
            Go to Products and use Adjust Stock on a few
            products, then come back here to see the chart.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Daily Stock Movement — Last 30 Days
          </h2>

          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart
              data={data.chartData}
              margin={{
                top: 5,
                right: 20,
                bottom: 20,
                left: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(value: string) =>
                  value.slice(5)
                }
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={50}
              />

              <YAxis tick={{ fontSize: 11 }} />

              <Tooltip
  formatter={(value, name) => [
    Number(value ?? 0),
    name === 'stockIn'
      ? 'Stock IN'
      : 'Stock OUT',
  ]}
/>

              <Legend
                formatter={(value: string) =>
                  value === 'stockIn'
                    ? 'Stock IN'
                    : 'Stock OUT'
                }
              />

              <Bar
                dataKey="stockIn"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                name="stockIn"
              />

              <Bar
                dataKey="stockOut"
                fill="#DC2626"
                radius={[4, 4, 0, 0]}
                name="stockOut"
              />

              <Line
                type="monotone"
                dataKey="stockIn"
                stroke="#065F46"
                dot={false}
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      
    </div>
  )
}