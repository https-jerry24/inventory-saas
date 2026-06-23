// src/app/dashboard/products/page.tsx
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

    const params = new URLSearchParams({
      search,
      sortBy,
    })

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>

          <p className="text-slate-500 mt-1">
            {products.length} products

            {lowStockCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {lowStockCount} low stock
              </span>
            )}
          </p>
        </div>

        <a
          href="/dashboard/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          + Add Product
        </a>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="createdAt">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No products found</p>

          <a
            href="/dashboard/products/new"
            className="text-blue-600 mt-2 inline-block"
          >
            Add your first product
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Product
                </th>

                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  SKU
                </th>

                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Category
                </th>

                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  Price
                </th>

                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  Qty
                </th>

                <th className="text-center px-4 py-3 font-semibold text-slate-600">
                  Status
                </th>

                <th className="text-center px-4 py-3 font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((p, i) => {
                const isLow =
                  p.quantity_on_hand <= p.reorder_point

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 ${
                      i % 2 === 0 ? '' : 'bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-400">
                          IMG
                        </div>

                        <span className="font-medium text-slate-900">
                          {p.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {p.sku}
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {p.categories?.name || '—'}
                    </td>

                    <td className="px-4 py-3 text-right font-medium">
                      Rs. {Number(p.unit_price).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right font-bold">
                      <span
                        className={
                          isLow ? 'text-red-600' : 'text-slate-900'
                        }
                      >
                        {p.quantity_on_hand}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          Low Stock
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          OK
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <a
                        href={`/dashboard/products/${p.id}/edit`}
                        className="text-blue-600 hover:underline text-xs mr-3"
                      >
                        Edit
                      </a>

                      <a
                        href={`/dashboard/products/${p.id}/adjust`}
                        className="text-green-600 hover:underline text-xs"
                      >
                        Adjust Stock
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