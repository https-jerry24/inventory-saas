'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  sku: string
  quantity_on_hand: number
  reorder_point: number
}

type AlertResult = {
  success?: boolean
  message?: string
  error?: string
}

export default function AlertsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<AlertResult | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const allProducts: Product[] =
          data.products || []

        const lowStock = allProducts.filter(
          (p) =>
            p.quantity_on_hand <=
            p.reorder_point
        )

        setProducts(lowStock)
      })
      .catch(console.error)
  }, [])

  async function sendAlertEmail() {
    setSending(true)
    setResult(null)

    try {
      const res = await fetch(
        '/api/alerts/low-stock',
        {
          method: 'POST',
        }
      )

      const data = await res.json()

      setResult(data)
    } catch {
      setResult({
        error:
          'Failed to send alert email.',
      })
    }

    setSending(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Stock Alerts
      </h1>

      <p className="text-slate-400 mb-8">
        Products that need restocking
      </p>

      <div
        className={`rounded-xl p-6 mb-8 ${
          products.length > 0
            ? 'bg-red-50 border border-red-200'
            : 'bg-green-50 border border-green-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-2xl font-bold ${
                products.length > 0
                  ? 'text-red-700'
                  : 'text-green-700'
              }`}
            >
              {products.length === 0
                ? 'All stock levels are healthy!'
                : `${products.length} products need attention`}
            </p>

            <p
              className={`text-sm mt-1 ${
                products.length > 0
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {products.length > 0
                ? 'Consider placing purchase orders'
                : 'No low-stock alerts at this time'}
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={sendAlertEmail}
              disabled={sending}
              className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {sending
                ? 'Sending...'
                : 'Send Alert Email'}
            </button>
          )}
        </div>

        {result && (
          <div className="mt-4 bg-white rounded-lg p-3 text-sm">
            {result.success ? (
              <p className="text-green-700 font-medium">
                {result.message}
              </p>
            ) : (
              <p className="text-red-700">
                {result.error}
              </p>
            )}
          </div>
        )}
      </div>

      {products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'Product',
                  'SKU',
                  'Current Qty',
                  'Reorder At',
                  'Deficit',
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left px-4 py-3 font-semibold text-slate-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const deficit =
                  product.reorder_point -
                  product.quantity_on_hand

                return (
                  <tr
                    key={product.id}
                    className={`border-t border-slate-100 ${
                      product.quantity_on_hand === 0
                        ? 'bg-red-50'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {product.name}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {product.sku}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-bold ${
                          product.quantity_on_hand ===
                          0
                            ? 'text-red-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {product.quantity_on_hand}
                        {product.quantity_on_hand ===
                          0 && ' (OUT)'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {product.reorder_point}
                    </td>

                    <td className="px-4 py-3 text-orange-600 font-medium">
                      +{deficit} needed
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