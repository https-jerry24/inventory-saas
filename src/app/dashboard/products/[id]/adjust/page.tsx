'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
type Product = {
  id: string
  name: string
  sku: string
  quantity_on_hand: number
  reorder_level: number
}

type Log = {
  change_qty: number
  new_qty: number
  reason: string
  log_date: string
}

export default function AdjustStockPage() {
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [changeQty, setChangeQty] = useState(0)
  const [reason, setReason] = useState('')
  const [type, setType] = useState<'add' | 'remove'>('add')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id) return

    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.product))

    fetch(`/api/inventory/logs?productId=${id}`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
  }, [id])

  async function handleAdjust() {
    if (!changeQty || changeQty <= 0) {
      setMessage('Enter a positive number')
      return
    }

    if (!reason) {
      setMessage('Reason is required')
      return
    }

    setLoading(true)
    setMessage('')

    const finalQty =
      type === 'add'
        ? changeQty
        : -changeQty

    const res = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: id,
        changeQty: finalQty,
        reason,
      }),
    })

    const data = await res.json()

    setLoading(false)

    if (!res.ok) {
      setMessage(data.error)
      return
    }

    setMessage(`Stock updated! New quantity: ${data.newQty}`)

    setProduct((prev) =>
      prev
        ? {
            ...prev,
            quantity_on_hand: data.newQty,
          }
        : null
    )

    setLogs((prev) => [
      {
        change_qty: finalQty,
        new_qty: data.newQty,
        reason,
        log_date: new Date().toISOString(),
      },
      ...prev,
    ])

    setChangeQty(0)
    setReason('')
  }

  if (!product) {
    return (
      <div className="p-6 text-slate-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <a
        href="/dashboard/products"
        className="text-blue-600 text-sm mb-4 block"
      >
        Back to Products
      </a>

      <h1 className="text-2xl font-bold mb-1">
        {product.name}
      </h1>

      <p className="text-slate-500 mb-6 font-mono text-sm">
        {product.sku}
      </p>

      {/* Current Stock */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
          Current Stock
        </p>

        <p
          className={`text-5xl font-bold ${
            product.quantity_on_hand <= product.reorder_level
              ? 'text-red-600'
              : 'text-slate-900'
          }`}
        >
          {product.quantity_on_hand}
        </p>

        <p className="text-slate-400 text-sm mt-1">
          Reorder at {product.reorder_level} units
        </p>
      </div>

      {/* Adjustment Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Adjust Stock
        </h2>

        {message && (
          <div
            className={`px-4 py-3 rounded-lg mb-4 text-sm ${
              message.includes('Error') ||
              message.includes('Cannot')
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {(['add', 'remove'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                type === t
                  ? t === 'add'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t === 'add'
                ? '+ Add Stock'
                : '- Remove Stock'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={changeQty}
              onChange={(e) =>
                setChangeQty(Number(e.target.value))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason *
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">
                — Select reason —
              </option>
              <option>Stock delivery received</option>
              <option>Items sold</option>
              <option>Damaged goods</option>
              <option>Returned by customer</option>
              <option>Stock count correction</option>
              <option>
                Transferred to another warehouse
              </option>
            </select>
          </div>

          <button
            onClick={handleAdjust}
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium text-white transition-colors ${
              type === 'add'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {loading
              ? 'Saving...'
              : `${type === 'add' ? 'Add' : 'Remove'} ${
                  changeQty || 0
                } Units`}
          </button>
        </div>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">
              Adjustment History
            </h2>

            <p className="text-xs text-slate-400">
              Inventory adjustment log
            </p>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">
                  Change
                </th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">
                  New Qty
                </th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">
                  Reason
                </th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-100"
                >
                  <td
                    className={`px-4 py-2 font-bold ${
                      log.change_qty > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {log.change_qty > 0
                      ? `+${log.change_qty}`
                      : log.change_qty}
                  </td>

                  <td className="px-4 py-2">
                    {log.new_qty}
                  </td>

                  <td className="px-4 py-2 text-slate-500">
                    {log.reason}
                  </td>

                  <td className="px-4 py-2 text-slate-400 text-xs">
                    {new Date(
                      log.log_date
                    ).toLocaleString()}
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