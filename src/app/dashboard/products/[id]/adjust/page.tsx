'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

type Product = {
  id:               string
  name:             string
  sku:              string
  quantity_on_hand: number
  reorder_level:    number
}

type Log = {
  change_qty: number
  new_qty:    number
  reason:     string
  log_date:   string
}

export default function AdjustStockPage() {
  const params = useParams()
  const id     = params.id as string

  const [product,   setProduct]   = useState<Product | null>(null)
  const [logs,      setLogs]      = useState<Log[]>([])
  const [changeQty, setChangeQty] = useState(0)
  const [reason,    setReason]    = useState('')
  const [type,      setType]      = useState<'add' | 'remove'>('add')
  const [loading,   setLoading]   = useState(false)
  const [message,   setMessage]   = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d.product))
    fetch(`/api/inventory/logs?productId=${id}`)
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
  }, [id])

  async function handleAdjust() {
    if (!changeQty || changeQty <= 0) { setMessage('Enter a positive number'); return }
    if (!reason)                       { setMessage('Reason is required');      return }

    setLoading(true)
    setMessage('')

    const finalQty = type === 'add' ? changeQty : -changeQty

    const res  = await fetch('/api/inventory/adjust', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId: id, changeQty: finalQty, reason }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setMessage(data.error); return }

    setMessage(`Updated! New quantity: ${data.newQty}`)
    setProduct(prev => prev ? { ...prev, quantity_on_hand: data.newQty } : null)
    setLogs(prev => [
      { change_qty: finalQty, new_qty: data.newQty, reason, log_date: new Date().toISOString() },
      ...prev,
    ])
    setChangeQty(0)
    setReason('')
  }

  if (!product) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    )
  }

  const isLow = product.quantity_on_hand <= product.reorder_level

  return (
    <div className="max-w-2xl mx-auto p-6">

            {/* Back */}
      <a
        href="/dashboard/products"
        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-5 transition"
      >
        ← Back to Products
      </a>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-slate-900 mb-0.5">
        {product.name}
      </h1>
      <p className="font-mono text-xs text-slate-500 mb-6">{product.sku}</p>

      {/* Current Stock */}
      <div
        className="bg-white rounded-xl border p-6 mb-5"
        style={{ borderTop: `3px solid ${isLow ? '#EF4444' : '#059669'}` }}
      >
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
          Current Stock Level
        </p>
        <p className={`text-6xl font-semibold mb-1 ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
          {product.quantity_on_hand}
        </p>
        <p className="text-slate-400 text-xs">
          Reorder alert at{' '}
          <span className="font-semibold text-slate-600">{product.reorder_level}</span> units
          {isLow && (
            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
              Low — reorder needed
            </span>
          )}
        </p>
      </div>

      {/* Adjustment Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <h2 className="font-semibold text-slate-900 mb-4">Adjust Stock</h2>

        {message && (
          <div
            className={`px-4 py-3 rounded-lg mb-4 text-sm font-medium border ${
              message.includes('Error') || message.includes('Cannot')
                ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}
          >
            {message}
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex gap-2 mb-4">
          {(['add', 'remove'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                type === t
                  ? t === 'add'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'add' ? '+ Add Stock' : '− Remove Stock'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={changeQty}
              onChange={e => setChangeQty(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              <option value="">— Select reason —</option>
              <option>Stock delivery received</option>
              <option>Items sold</option>
              <option>Damaged goods</option>
              <option>Returned by customer</option>
              <option>Stock count correction</option>
              <option>Transferred to another warehouse</option>
            </select>
          </div>

          <button
            onClick={handleAdjust}
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'add'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading
              ? 'Saving…'
              : `${type === 'add' ? 'Add' : 'Remove'} ${changeQty || 0} Units`}
          </button>
        </div>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">Adjustment History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              From partitioned <span className="font-mono">inventory_logs</span> table
            </p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Change</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">New Qty</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`px-4 py-3 font-bold ${log.change_qty > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{log.new_qty}</td>
                  <td className="px-4 py-3 text-slate-500">{log.reason}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                    {new Date(log.log_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}