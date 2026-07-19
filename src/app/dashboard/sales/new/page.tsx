'use client'

import { useEffect, useMemo, useState } from 'react'

type Customer = {
  id: string
  contact_name: string
  business_name: string | null
  customer_type: string
}

type Product = {
  id: string
  name: string
  sku: string
  unit_price: number
  quantity_on_hand: number
}

type CartItem = {
  product: Product
  quantity: number
}

export default function NewSalePage() {
  const [saleType, setSaleType] =
    useState<'B2B' | 'B2C'>('B2C')

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [customerId, setCustomerId] = useState('')

  const [selectedProduct, setSelectedProduct] = useState('')

  const [qty, setQty] = useState(1)

  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    fetch('/api/sales/init')
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d.customers ?? [])
        setProducts(d.products ?? [])
      })
  }, [])

  function addProduct() {
    if (!selectedProduct) return

    const product = products.find(
      (p) => p.id === selectedProduct
    )

    if (!product) return

    setCart((prev) => {
      const existing = prev.find(
        (x) => x.product.id === product.id
      )

      if (existing) {
        return prev.map((x) =>
          x.product.id === product.id
            ? {
                ...x,
                quantity: x.quantity + qty,
              }
            : x
        )
      }

      return [
        ...prev,
        {
          product,
          quantity: qty,
        },
      ]
    })

    setQty(1)
    setSelectedProduct('')
  }

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        item.product.unit_price * item.quantity,
      0
    )
  }, [cart])

  async function completeSale() {
  if (cart.length === 0) {
    alert('Add products first.')
    return
  }

  const res = await fetch('/api/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      saleType,
      customerId: saleType === 'B2B' ? customerId : null,
      paymentMethod: 'Cash',
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.unit_price,
      })),
    }),
  })

  const data = await res.json()

  console.log('API Response:', data)

  if (!res.ok) {
    alert(data.error)
    return
  }

  if (!data.order?.id) {
    alert('Sale created but ID was not returned.')
    return
  }

  window.location.href = `/dashboard/sales/${data.order.id}`
}

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        New Sale
      </h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">

        <div>

          <label className="font-semibold text-slate-700 block mb-2">
            Sale Type
          </label>

          <select
            className="border rounded-xl p-3 w-64 text-slate-900"
            value={saleType}
            onChange={(e) =>
              setSaleType(
                e.target.value as 'B2B' | 'B2C'
              )
            }
          >
            <option value="B2C">
              B2C
            </option>

            <option value="B2B">
              B2B
            </option>

          </select>

        </div>

        {saleType === 'B2B' && (
          <div>

            <label className="font-semibold text-slate-700 block mb-2">
              Customer
            </label>

            <select
              className="border rounded-xl p-3 w-full text-slate-900"
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
            >
              <option value="">
                Select Customer
              </option>

              {customers
                .filter(
                  (c) =>
                    c.customer_type === 'B2B'
                )
                .map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.business_name}
                  </option>
                ))}
            </select>

          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">

          <select
            className="border rounded-xl p-3 text-slate-900"
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(
                e.target.value
              )
            }
          >
            <option value="">
              Select Product
            </option>

            {products.map((p) => (
              <option
                key={p.id}
                value={p.id}
              >
                {p.name} ({p.quantity_on_hand})
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border rounded-xl p-3 text-slate-900"
            value={qty}
            min={1}
            onChange={(e) =>
              setQty(Number(e.target.value))
            }
          />

          <button
            onClick={addProduct}
            className="bg-emerald-600 text-white rounded-xl"
          >
            Add Product
          </button>

        </div>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3 text-slate-700">
                Product
              </th>

              <th className="text-right text-slate-700">
                Qty
              </th>

              <th className="text-right text-slate-700">
                Price
              </th>

              <th className="text-right text-slate-700">
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {cart.map((item) => (
              <tr key={item.product.id}>

                <td className="py-3 text-slate-900">
                  {item.product.name}
                </td>

                <td className="text-right text-slate-700">
                  {item.quantity}
                </td>

                <td className="text-right text-slate-700">
                  Rs {item.product.unit_price.toLocaleString()}
                </td>

                <td className="text-right font-semibold text-slate-900">
                  Rs{' '}
                  {(
                    item.product.unit_price *
                    item.quantity
                  ).toLocaleString()}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        <div className="flex justify-end">

          <div className="text-right">

            <p className="text-slate-500">
              Subtotal
            </p>

            <h2 className="text-3xl font-bold text-emerald-700">
              Rs {subtotal.toLocaleString()}
            </h2>

          </div>

        </div>

        <button
  onClick={completeSale}
  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
>
  Complete Sale
</button>

      </div>

    </div>
  )
}