'use client'

import { useEffect, useState, useCallback } from 'react'

type Product = {
  id: string
  name: string
  sku: string
  unit_price: number
  quantity_on_hand: number
  reorder_point: number
  categories?: { name: string }
  suppliers?: { name: string }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, sortBy })
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }, [search, sortBy])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const lowStockCount = products.filter(
    (p) => p.quantity_on_hand <= p.reorder_point
  ).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Products
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {lowStockCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {lowStockCount} low stock
              </span>
            )}
          </p>
        </div>

        <a
          href="/dashboard/products/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Add Product
        </a>
      </div>

      {/* ── Search & Sort ──────────────────────── */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="createdAt">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* ── Table ──────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center text-slate-400 text-sm">
          Loading products…
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <p className="text-slate-500 font-medium mb-1">No products found</p>
          <a
            href="/dashboard/products/new"
            className="text-emerald-600 text-sm hover:underline"
          >
            Add your first product
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const isLow = p.quantity_on_hand <= p.reorder_point

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 flex-shrink-0">
                          {p.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">
                          {p.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {p.sku}
                    </td>

                    <td className="px-4 py-3">
                      {p.categories?.name ? (
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                          {p.categories.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      Rs. {Number(p.unit_price).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          isLow ? 'text-red-600' : 'text-slate-900'
                        }`}
                      >
                        {p.quantity_on_hand}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          Low Stock
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          OK
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <a
                        href={`/dashboard/products/${p.id}/edit`}
                        className="text-emerald-600 hover:text-emerald-700 text-xs font-medium mr-3 hover:underline"
                      >
                        Edit
                      </a>

                      <a
                        href={`/dashboard/products/${p.id}/adjust`}
                        className="text-slate-500 hover:text-slate-700 text-xs font-medium hover:underline"
                      >
                        Adjust
                      </a>
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