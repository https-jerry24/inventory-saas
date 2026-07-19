'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string }
type Supplier = { id: string; name: string }

type ProductFormData = {
  name:           string
  sku:            string
  barcode:        string
  unitPrice:      number
  quantityOnHand: number
  reorderLevel:   number
  categoryId:     string
  supplierId:     string
  imageUrl:       string
}

type Props = {
  productId?:   string
  initialData?: Partial<ProductFormData>
}



export default function ProductForm({ productId, initialData }: Props) {
  const isEdit = Boolean(productId)
  const router = useRouter()

  const [form, setForm] = useState<ProductFormData>({
    name:           '',
    sku:            '',
    barcode:        '',
    unitPrice:      0,
    quantityOnHand: 0,
    reorderLevel:   10,
    categoryId:     '',
    supplierId:     '',
    imageUrl:       '',
    ...initialData,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers,  setSuppliers]  = useState<Supplier[]>([])
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/suppliers').then(r  => r.json()).then(d => setSuppliers(d.suppliers   || []))
  }, [])

  const set = (field: keyof ProductFormData, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }))

  

  async function handleSubmit() {
    setLoading(true); setError(''); setSuccess('')
    const body = {
      name:           form.name,
      sku:            form.sku,
      barcode:        form.barcode        || undefined,
      unitPrice:      Number(form.unitPrice),
      quantityOnHand: Number(form.quantityOnHand),
      reorderLevel:   Number(form.reorderLevel),
      categoryId:     form.categoryId     || undefined,
      supplierId:     form.supplierId     || undefined,
      imageUrl:       form.imageUrl       || undefined,
    }
    const url    = isEdit ? `/api/products/${productId}` : '/api/products'
    const method = isEdit ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data   = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setSuccess(isEdit ? 'Product updated!' : 'Product created!')
    setTimeout(() => router.push('/dashboard/products'), 1200)
  }

  async function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await fetch(`/api/products/${productId}`, { method: 'DELETE' })
    router.push('/dashboard/products')
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
                <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isEdit ? 'Update product details' : 'Fill in the details below'}
          </p>
        </div>

        <a
          href="/dashboard/products"
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
        >
          ← Back
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

        

        {/* Second Product Name (original field) */}
        <div>
          <label className={labelCls}>Product Name *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Samsung Galaxy S24"
            className={inputCls}
          />
        </div>

        {/* SKU + Barcode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>SKU *</label>
            <input
              value={form.sku}
              onChange={e => set('sku', e.target.value)}
              placeholder="e.g. ELEC-001"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Barcode</label>
            <input
              value={form.barcode}
              onChange={e => set('barcode', e.target.value)}
              placeholder="e.g. 8901234567890"
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>

        {/* Price + Qty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Unit Price (Rs.) *</label>
            <input
              type="number"
              value={form.unitPrice}
              onChange={e => set('unitPrice', Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Quantity in Stock *</label>
            <input
              type="number"
              value={form.quantityOnHand}
              onChange={e => set('quantityOnHand', Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        {/* Reorder Level */}
        <div>
          <label className={labelCls}>
            Reorder Level
            <span className="text-slate-400 font-normal ml-1 text-xs">
              alert when qty drops below this
            </span>
          </label>
          <input
            type="number"
            value={form.reorderLevel}
            onChange={e => set('reorderLevel', Number(e.target.value))}
            className={inputCls}
          />
        </div>

        {/* Category + Supplier */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select
              value={form.categoryId}
              onChange={e => set('categoryId', e.target.value)}
              className={inputCls}
            >
              <option value="">— Select category —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Supplier</label>
            <select
              value={form.supplierId}
              onChange={e => set('supplierId', e.target.value)}
              className={inputCls}
            >
              <option value="">— Select supplier —</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className={labelCls}>Image URL</label>
          <input
            value={form.imageUrl}
            onChange={e => set('imageUrl', e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="preview"
              className="mt-2 h-16 rounded-lg border border-slate-200 object-cover"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition border border-red-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}