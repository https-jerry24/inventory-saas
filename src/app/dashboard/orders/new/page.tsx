'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Product         = { id: string; name: string; sku: string; unit_price: number }
type Supplier        = { id: string; name: string }
type OrderItem       = { productId: string; quantity: number; unitCost: number }
type ProductsResp    = { products: Product[] }
type SuppliersResp   = { suppliers: Supplier[] }
type ErrorResp       = { error?: string }

export default function NewOrderPage() {
  const router = useRouter()

  const [products,   setProducts]   = useState<Product[]>([])
  const [suppliers,  setSuppliers]  = useState<Supplier[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [expectedAt, setExpectedAt] = useState('')
  const [items,      setItems]      = useState<OrderItem[]>([{ productId:'', quantity:1, unitCost:0 }])
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, sRes] = await Promise.all([fetch('/api/products'), fetch('/api/suppliers')])
        const pData: ProductsResp  = await pRes.json()
        const sData: SuppliersResp = await sRes.json()
        setProducts(pData.products   ?? [])
        setSuppliers(sData.suppliers ?? [])
      } catch (err) { console.error('Failed to load data:', err) }
    }
    loadData()
  }, [])

  const addItem    = () => setItems(prev => [...prev, { productId:'', quantity:1, unitCost:0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const updateItem = (i: number, field: keyof OrderItem, value: string | number) =>
    setItems(prev => prev.map((item, idx) =>
      idx === i ? { ...item, [field]: field === 'quantity' || field === 'unitCost' ? Number(value) : value } : item
    ))

  const handleProductSelect = (i: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    updateItem(i, 'productId', productId)
    if (product) updateItem(i, 'unitCost', Number(product.unit_price))
  }

  const orderTotal = items.reduce((sum, item) => sum + Number(item.unitCost) * Number(item.quantity), 0)

  async function handleSubmit() {
    if (!supplierId)                        { setError('Please select a supplier');                     return }
    if (items.some(item => !item.productId)){ setError('Please select a product for each line item');   return }
    try {
      setLoading(true); setError('')
      const res  = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          expectedAt: expectedAt || undefined,
          items: items.map(item => ({ productId: item.productId, quantity: Number(item.quantity), unitCost: Number(item.unitCost) })),
        }),
      })
      const data: ErrorResp = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create order'); return }
      router.push('/dashboard/orders')
    } catch (err) { console.error(err); setError('Failed to create order') }
    finally      { setLoading(false) }
  }

  const inputCls  = "border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition"
  const labelCls  = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">New Purchase Order</h1>
          <p className="text-slate-500 text-sm mt-0.5">Select supplier and add line items</p>
        </div>
        <a href="/dashboard/orders" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition">
          ← Back
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

        {/* Supplier */}
        <div>
          <label className={labelCls}>Supplier *</label>
          <select
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
            className={`w-full ${inputCls}`}
          >
            <option value="">— Select supplier —</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Expected Date */}
        <div>
          <label className={labelCls}>Expected Delivery Date</label>
          <input
            type="date"
            value={expectedAt}
            onChange={e => setExpectedAt(e.target.value)}
            className={`w-full ${inputCls}`}
          />
        </div>

        {/* Line Items */}
        <div>
          <label className={labelCls}>Products *</label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={item.productId}
                  onChange={e => handleProductSelect(i, e.target.value)}
                  className={`flex-1 ${inputCls}`}
                >
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input
                  type="number" min="1"
                  value={item.quantity}
                  onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                  className={`w-20 ${inputCls} text-center`}
                  placeholder="Qty"
                />
                <input
                  type="number" min="0"
                  value={item.unitCost}
                  onChange={e => updateItem(i, 'unitCost', Number(e.target.value))}
                  className={`w-28 ${inputCls}`}
                  placeholder="Cost"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-slate-400 hover:text-red-500 font-bold px-1.5 text-lg leading-none transition"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
          >
            + Add another product
          </button>
        </div>

        {/* Total */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Order Total</span>
          <span className="text-xl font-semibold text-emerald-700">
            Rs. {Math.round(orderTotal).toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating…' : 'Create Purchase Order'}
        </button>
      </div>
    </div>
  )
}