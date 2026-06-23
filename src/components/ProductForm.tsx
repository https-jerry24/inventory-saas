// src/components/ProductForm.tsx
// Reusable form for both CREATE and EDIT product

'use client'
import FoodFactsSearch from '@/components/FoodFactsSearch'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  name: string
}

type Supplier = {
  id: string
  name: string
}

type ProductFormData = {
  name: string
  sku: string
  barcode: string
  unitPrice: number
  quantityOnHand: number
  reorderLevel: number
  categoryId: string
  supplierId: string
  imageUrl: string
}


type Props = {
  productId?: string
  initialData?: Partial<ProductFormData>
}

type FoodProduct = {
  barcode: string
  name: string
  brand: string
  imageUrl: string
  category: string
}

export default function ProductForm({
  productId,
  initialData,
}: Props) {
  const isEdit = Boolean(productId)
  const router = useRouter()

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    sku: '',
    barcode: '',
    unitPrice: 0,
    quantityOnHand: 0,
    reorderLevel: 10,
    categoryId: '',
    supplierId: '',
    imageUrl: '',
    ...initialData,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))

    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((d) => setSuppliers(d.suppliers || []))
  }, [])

  const set = (field: keyof ProductFormData, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleFoodFactsSelect(product: FoodProduct) {
  setForm((prev) => ({
    ...prev,
    name: product.name + (product.brand ? ` — ${product.brand}` : ''),
    barcode: product.barcode || prev.barcode,
    imageUrl: product.imageUrl || prev.imageUrl,

    categoryId:
      categories.find(
        (c) =>
          c.name.toLowerCase().includes('food') ||
          c.name.toLowerCase().includes('beverage')
      )?.id || prev.categoryId,
  }))
}

  async function handleSubmit() {
    setLoading(true)
    setError('')
    setSuccess('')

    const body = {
      name: form.name,
      sku: form.sku,
      barcode: form.barcode || undefined,
      unitPrice: Number(form.unitPrice),
      quantityOnHand: Number(form.quantityOnHand),
      reorderLevel: Number(form.reorderLevel),
      categoryId: form.categoryId || undefined,
      supplierId: form.supplierId || undefined,
      imageUrl: form.imageUrl || undefined,
    }

    const url = isEdit
      ? `/api/products/${productId}`
      : '/api/products'

    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setSuccess(
      isEdit ? 'Product updated!' : 'Product created!'
    )

    setTimeout(() => {
      router.push('/dashboard/products')
    }, 1200)
  }

  async function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) {
      return
    }

    await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    })

    router.push('/dashboard/products')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        <a
          href="/dashboard/products"
          className="text-slate-500 hover:text-slate-700 text-sm"
        >
          Back to Products
        </a>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">

  <FoodFactsSearch onSelect={handleFoodFactsSelect} />

  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Product Name *
    </label>

    <input
      value={form.name}
      onChange={(e) => set('name', e.target.value)}
      placeholder="e.g. Samsung Galaxy S24"
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
    />
  </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Name *
          </label>

          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Samsung Galaxy S24"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SKU *
            </label>

            <input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="e.g. ELEC-001"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Barcode
            </label>

            <input
              value={form.barcode}
              onChange={(e) => set('barcode', e.target.value)}
              placeholder="e.g. 8901234567890"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Unit Price (Rs.) *
            </label>

            <input
              type="number"
              value={form.unitPrice}
              onChange={(e) =>
                set('unitPrice', Number(e.target.value))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity in Stock *
            </label>

            <input
              type="number"
              value={form.quantityOnHand}
              onChange={(e) =>
                set('quantityOnHand', Number(e.target.value))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reorder Level
            <span className="text-slate-400 font-normal ml-1">
              (alert when qty drops below this)
            </span>
          </label>

          <input
            type="number"
            value={form.reorderLevel}
            onChange={(e) =>
              set('reorderLevel', Number(e.target.value))
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>

            <select
              value={form.categoryId}
              onChange={(e) =>
                set('categoryId', e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">— Select category —</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier
            </label>

            <select
              value={form.supplierId}
              onChange={(e) =>
                set('supplierId', e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">— Select supplier —</option>

              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Image URL
          </label>

          <input
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            placeholder="https://..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />

          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="preview"
              className="mt-2 h-16 rounded"
            />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Saving...'
              : isEdit
              ? 'Save Changes'
              : 'Add Product'}
          </button>

          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}