'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
  sku: string
  unit_price: number
}

type Supplier = {
  id: string
  name: string
}

type OrderItem = {
  productId: string
  quantity: number
  unitCost: number
}

type ProductsResponse = {
  products: Product[]
}

type SuppliersResponse = {
  suppliers: Supplier[]
}

type ErrorResponse = {
  error?: string
}

export default function NewOrderPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [supplierId, setSupplierId] = useState('')
  const [expectedAt, setExpectedAt] = useState('')

  const [items, setItems] = useState<OrderItem[]>([
    {
      productId: '',
      quantity: 1,
      unitCost: 0,
    },
  ])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, suppliersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/suppliers'),
        ])

        const productsData: ProductsResponse =
          await productsRes.json()

        const suppliersData: SuppliersResponse =
          await suppliersRes.json()

        setProducts(productsData.products ?? [])
        setSuppliers(suppliersData.suppliers ?? [])
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [])

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        quantity: 1,
        unitCost: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]:
                field === 'quantity' ||
                field === 'unitCost'
                  ? Number(value)
                  : value,
            }
          : item
      )
    )
  }

  const handleProductSelect = (
    index: number,
    productId: string
  ) => {
    const product = products.find(
      (p) => p.id === productId
    )

    updateItem(index, 'productId', productId)

    if (product) {
      updateItem(
        index,
        'unitCost',
        Number(product.unit_price)
      )
    }
  }

  const orderTotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.unitCost) *
        Number(item.quantity),
    0
  )

  async function handleSubmit() {
    if (!supplierId) {
      setError('Please select a supplier')
      return
    }

    if (items.some((item) => !item.productId)) {
      setError(
        'Please select a product for each line'
      )
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId,
          expectedAt: expectedAt || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost),
          })),
        }),
      })

      const data: ErrorResponse =
        await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Failed to create order')
        return
      }

      router.push('/dashboard/orders')
    } catch (error) {
      console.error(error)
      setError('Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          New Purchase Order
        </h1>

        <a
          href="/dashboard/orders"
          className="text-slate-500 text-sm"
        >
          Back
        </a>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Supplier *
          </label>

          <select
            value={supplierId}
            onChange={(e) =>
              setSupplierId(e.target.value)
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">
              — Select supplier —
            </option>

            {suppliers.map((supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expected Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Expected Delivery Date
          </label>

          <input
            type="date"
            value={expectedAt}
            onChange={(e) =>
              setExpectedAt(e.target.value)
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Products */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Products *
          </label>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 items-center"
              >
                <select
                  value={item.productId}
                  onChange={(e) =>
                    handleProductSelect(
                      index,
                      e.target.value
                    )
                  }
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      index,
                      'quantity',
                      Number(e.target.value)
                    )
                  }
                  className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />

                <input
                  type="number"
                  min="0"
                  value={item.unitCost}
                  onChange={(e) =>
                    updateItem(
                      index,
                      'unitCost',
                      Number(e.target.value)
                    )
                  }
                  className="w-28 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    className="text-red-400 hover:text-red-600 font-bold px-2"
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
            className="mt-2 text-teal-600 text-sm font-medium hover:underline"
          >
            + Add another product
          </button>
        </div>

        {/* Total */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
          <span className="font-semibold text-slate-700">
            Order Total
          </span>

          <span className="text-xl font-bold text-teal-700">
            Rs.{' '}
            {Math.round(orderTotal).toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 text-white rounded-lg py-2 font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {loading
            ? 'Creating...'
            : 'Create Purchase Order'}
        </button>
      </div>
    </div>
  )
}