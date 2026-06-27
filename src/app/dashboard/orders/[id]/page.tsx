'use client'

import { useState, useEffect } from 'react'

type OrderItem = { id: string; quantity: number; unit_cost: number; products: { name: string } | null }
type Supplier  = { name: string }
type Order     = { id: string; status: string; expected_at?: string | null; suppliers: Supplier | null; purchase_order_items: OrderItem[] }

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100  text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [order,   setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        const found = data.orders?.find((o: Order) => o.id === id)
        if (found) setOrder(found)
      })
  }, [id])

  async function handleDeliver() {
    if (!confirm('Mark this order as delivered? This will update all product stock levels.')) return
    setLoading(true)
    const res  = await fetch(`/api/orders/${id}/deliver`, { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setMessage(data.message)
      setOrder(prev => prev ? { ...prev, status: 'delivered' } : prev)
    } else {
      setMessage(data.error)
    }
  }

  if (!order) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    )
  }

  const total = order.purchase_order_items.reduce(
    (sum, item) => sum + Number(item.unit_cost) * item.quantity, 0
  )

  return (
    <div className="max-w-2xl mx-auto p-6">

      <a href="/dashboard/orders" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-5 block transition">
        ← Back to Orders
      </a>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Purchase Order</h1>
          <p className="text-slate-400 font-mono text-xs mt-1">#{order.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg mb-4 text-sm border ${
          message.toLowerCase().includes('error')
            ? 'bg-red-50 border-red-100 text-red-700'
            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {message}
        </div>
      )}

      {/* Supplier Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Supplier</p>
        <p className="font-semibold text-slate-900">{order.suppliers?.name ?? 'Unknown Supplier'}</p>
        {order.expected_at && (
          <p className="text-sm text-slate-400 mt-1.5">
            Expected: {new Date(order.expected_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Product','Qty','Unit Cost','Subtotal'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.purchase_order_items.map(item => (
              <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.products?.name ?? 'Unknown Product'}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-600">
                  Rs. {Number(item.unit_cost).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  Rs. {(Number(item.unit_cost) * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={3} className="px-4 py-3 font-semibold text-right text-slate-700">
                Order Total
              </td>
              <td className="px-4 py-3 font-bold text-right text-emerald-700">
                Rs. {Math.round(total).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action */}
      {order.status !== 'delivered' ? (
        <button
          onClick={handleDeliver}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : 'Mark as Delivered — Update Stock Now'}
        </button>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-emerald-700 font-semibold text-sm">
            ✓ Delivered — Stock levels have been updated
          </p>
        </div>
      )}
    </div>
  )
}