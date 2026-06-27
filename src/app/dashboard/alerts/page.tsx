'use client'

import { useEffect, useState } from 'react'

type Product = {
  id:               string
  name:             string
  sku:              string
  quantity_on_hand: number
  reorder_point:    number
}

type AlertResult = { success?: boolean; message?: string; error?: string }

export default function AlertsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sending,  setSending]  = useState(false)
  const [result,   setResult]   = useState<AlertResult | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const all: Product[] = data.products || []
        setProducts(all.filter(p => p.quantity_on_hand <= p.reorder_point))
      })
      .catch(console.error)
  }, [])

  async function sendAlertEmail() {
    setSending(true); setResult(null)
    try {
      const res  = await fetch('/api/alerts/low-stock', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Failed to send alert email.' })
    }
    setSending(false)
  }

  const hasAlerts = products.length > 0

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">
        Stock Alerts
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Products at or below their reorder point
      </p>

      {/* Summary Banner */}
      <div
        className={`rounded-xl border p-5 mb-6 ${
          hasAlerts
            ? 'bg-red-50   border-red-200'
            : 'bg-emerald-50 border-emerald-200'
        }`}
        style={{ borderTop: `3px solid ${hasAlerts ? '#DC2626' : '#059669'}` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xl font-semibold mb-1 ${hasAlerts ? 'text-red-700' : 'text-emerald-700'}`}>
              {hasAlerts
                ? `${products.length} product${products.length !== 1 ? 's' : ''} need attention`
                : 'All stock levels are healthy!'}
            </p>
            <p className={`text-xs ${hasAlerts ? 'text-red-600' : 'text-emerald-600'}`}>
              {hasAlerts
                ? 'Consider placing purchase orders for items below'
                : 'No low-stock alerts at this time'}
            </p>
          </div>
          {hasAlerts && (
            <button
              onClick={sendAlertEmail}
              disabled={sending}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending…
                </>
              ) : 'Send Alert Email'}
            </button>
          )}
        </div>

        {result && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm border ${
            result.success
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50    border-red-100    text-red-700'
          }`}>
            {result.success ? result.message : result.error}
          </div>
        )}
      </div>

      {/* Table */}
      {hasAlerts && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Product','SKU','Current Qty','Reorder At','Deficit'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const deficit   = p.reorder_point - p.quantity_on_hand
                const isOut     = p.quantity_on_hand === 0
                return (
                  <tr
                    key={p.id}
                    className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${isOut ? 'bg-red-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${isOut ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.quantity_on_hand}
                        {isOut && (
                          <span className="ml-1.5 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                            OUT
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.reorder_point}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-700 font-semibold text-xs bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                        +{deficit} needed
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