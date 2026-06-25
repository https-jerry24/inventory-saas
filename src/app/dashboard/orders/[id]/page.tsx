'use client'

import { useState, useEffect } from 'react'

type OrderItem = {
  id: string
  quantity: number
  unit_cost: number
  products: {
    name: string
  } | null
}

type Supplier = {
  name: string
}

type Order = {
  id: string
  status: string
  expected_at?: string | null
  suppliers: Supplier | null
  purchase_order_items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        const found = data.orders?.find(
          (o: Order) => o.id === id
        )

        if (found) {
          setOrder(found)
        }
      })
  }, [id])

  async function handleDeliver() {
    const confirmed = window.confirm(
      'Mark this order as delivered? This will update all product stock levels.'
    )

    if (!confirmed) return

    setLoading(true)

    const res = await fetch(
      `/api/orders/${id}/deliver`,
      {
        method: 'POST',
      }
    )

    const data = await res.json()

    setLoading(false)

    if (res.ok) {
      setMessage(data.message)

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'delivered',
            }
          : prev
      )
    } else {
      setMessage(data.error)
    }
  }

  if (!order) {
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading...
      </div>
    )
  }

  const total = order.purchase_order_items.reduce(
    (sum, item) =>
      sum + Number(item.unit_cost) * item.quantity,
    0
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <a
        href="/dashboard/orders"
        className="text-teal-600 text-sm mb-4 block"
      >
        Back to Orders
      </a>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Purchase Order
          </h1>

          <p className="text-slate-400 font-mono text-xs mt-1">
            #{order.id}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            STATUS_COLORS[order.status] ??
            'bg-gray-100 text-gray-700'
          }`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
        <p className="text-sm text-slate-500 mb-1">
          Supplier
        </p>

        <p className="font-semibold">
          {order.suppliers?.name ?? 'Unknown Supplier'}
        </p>

        {order.expected_at && (
          <p className="text-sm text-slate-400 mt-2">
            Expected:{' '}
            {new Date(
              order.expected_at
            ).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Product
              </th>

              <th className="text-right px-4 py-3 font-semibold text-slate-600">
                Qty
              </th>

              <th className="text-right px-4 py-3 font-semibold text-slate-600">
                Unit Cost
              </th>

              <th className="text-right px-4 py-3 font-semibold text-slate-600">
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            {order.purchase_order_items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-3">
                  {item.products?.name ??
                    'Unknown Product'}
                </td>

                <td className="px-4 py-3 text-right">
                  {item.quantity}
                </td>

                <td className="px-4 py-3 text-right">
                  Rs.{' '}
                  {Number(
                    item.unit_cost
                  ).toLocaleString()}
                </td>

                <td className="px-4 py-3 text-right font-medium">
                  Rs.{' '}
                  {(
                    Number(item.unit_cost) *
                    item.quantity
                  ).toLocaleString()}
                </td>
              </tr>
            ))}

            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td
                colSpan={3}
                className="px-4 py-3 font-bold text-right"
              >
                Total
              </td>

              <td className="px-4 py-3 font-bold text-right">
                Rs. {Math.round(total).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {order.status !== 'delivered' ? (
        <button
          onClick={handleDeliver}
          disabled={loading}
          className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading
            ? 'Processing...'
            : 'Mark as Delivered — Update Stock Now'}
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 font-medium">
          Delivered — Stock has been updated
        </div>
      )}
    </div>
  )
}