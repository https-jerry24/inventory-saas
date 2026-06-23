// src/components/FoodFactsSearch.tsx
// Search Open Food Facts and let user pick a product to auto-fill the form

'use client'

import { useState } from 'react'

type FoodProduct = {
  barcode: string
  name: string
  brand: string
  imageUrl: string
  category: string
}

type Props = {
  onSelect: (product: FoodProduct) => void
}

export default function FoodFactsSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [results, setResults] = useState<FoodProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query && !barcode) return

    setLoading(true)

    const params = barcode
      ? `barcode=${barcode}`
      : `query=${encodeURIComponent(query)}`

    const res = await fetch(`/api/food-facts?${params}`)
    const data = await res.json()

    setResults(data.products || [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-3">
        Import from Open Food Facts
        <span className="text-xs font-normal text-blue-600 ml-2">
          (auto-fill product details)
        </span>
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          placeholder="Search by product name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm"
        />

        <input
          placeholder="Or type barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-40 border border-blue-300 rounded-lg px-3 py-2 text-sm font-mono"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {searched && results.length === 0 && (
        <p className="text-blue-600 text-sm">
          No products found. Try a different search term.
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.barcode || p.name}
              onClick={() => onSelect(p)}
              className="flex items-center gap-3 bg-white rounded-lg p-3 text-left hover:bg-blue-50 border border-blue-100"
            >
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}

              <div>
                <p className="font-medium text-slate-900 text-sm">
                  {p.name}
                </p>

                <p className="text-xs text-slate-500">
                  {p.brand} • {p.category}
                </p>

                {p.barcode && (
                  <p className="text-xs font-mono text-slate-400">
                    {p.barcode}
                  </p>
                )}
              </div>

              <span className="ml-auto text-blue-600 text-xs font-medium">
                Use this
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}