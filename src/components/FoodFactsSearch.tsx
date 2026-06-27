'use client'

import { useState } from 'react'

type FoodProduct = {
  barcode:  string
  name:     string
  brand:    string
  imageUrl: string
  category: string
}

type Props = {
  onSelect: (product: FoodProduct) => void
}

export default function FoodFactsSearch({ onSelect }: Props) {
  const [query,    setQuery]    = useState('')
  const [barcode,  setBarcode]  = useState('')
  const [results,  setResults]  = useState<FoodProduct[]>([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query && !barcode) return
    setLoading(true)
    const params = barcode
      ? `barcode=${barcode}`
      : `query=${encodeURIComponent(query)}`
    const res  = await fetch(`/api/food-facts?${params}`)
    const data = await res.json()
    setResults(data.products || [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-2">
      <h3 className="font-semibold text-emerald-900 mb-0.5">
        Import from Open Food Facts
        <span className="text-xs font-normal text-emerald-600 ml-2">
          auto-fill product details
        </span>
      </h3>
      <p className="text-xs text-emerald-700 mb-3">
        Search by name or scan a barcode to auto-populate the form below
      </p>

      <div className="flex gap-2 mb-3">
        <input
          placeholder="Search by product name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 border border-emerald-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
        <input
          placeholder="Or type barcode…"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          className="w-40 border border-emerald-200 bg-white rounded-lg px-3 py-2 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '…' : 'Search'}
        </button>
      </div>

      {searched && results.length === 0 && (
        <p className="text-emerald-700 text-sm">
          No products found. Try a different search term.
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {results.map(p => (
            <button
              key={p.barcode || p.name}
              onClick={() => onSelect(p)}
              className="flex items-center gap-3 bg-white rounded-lg p-3 text-left hover:bg-emerald-50 border border-emerald-100 transition"
            >
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-11 h-11 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 text-sm truncate">{p.name}</p>
                <p className="text-xs text-slate-500">{p.brand} · {p.category}</p>
                {p.barcode && (
                  <p className="text-xs font-mono text-slate-400">{p.barcode}</p>
                )}
              </div>
              <span className="text-emerald-600 text-xs font-semibold flex-shrink-0">
                Use →
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}