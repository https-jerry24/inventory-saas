'use client'

import { useEffect, useState } from 'react'
import InvoiceActions from '@/components/InvoiceActions'
import type { InvoiceData } from '@/lib/invoicePDF'

type Product = {
  name: string
  sku: string
}

type Item = {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  products: Product | null
}

type Customer = {
  contact_name: string
  business_name: string | null
  email: string | null
  phone: string | null
}

type Sale = {
  id: string
  sale_type: 'B2B' | 'B2C'
  status: string
  subtotal: number
  total: number
  created_at: string
  customers: Customer | null
  sales_order_items: Item[]
}

export default function SalePage({
  params,
}: {
  params: { id: string }
}) {
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSale() {
      const res = await fetch(`/api/sales/${params.id}`)
      const data = await res.json()

      console.log(data)

      if (!res.ok) {
        alert(data.error)
        return
      }

      setSale(data)
      setLoading(false)
    }

    loadSale()
  }, [params.id])

  if (loading) {
    return <div className="p-10">Loading...</div>
  }

  if (!sale) {
    return <div className="p-10">Sale not found.</div>
  }

  const invoice: InvoiceData = {
    invoiceNumber: `SALE-${sale.id.slice(0, 8)}`,
    type: 'PURCHASE',
    issuedAt: sale.created_at,

    companyName: 'StockFlow',
    companyAddress: 'Lahore, Pakistan',
    companyPhone: '+92 300 1234567',
    companyEmail: 'sales@stockflow.pk',

    supplierName:
      sale.customers?.business_name ??
      sale.customers?.contact_name ??
      'Walk-in Customer',

    items: sale.sales_order_items.map((item) => ({
      description: item.products?.name ?? '',
      sku: item.products?.sku,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),

    subtotal: sale.subtotal,
    totalAmount: sale.total,
    status: sale.status,
    notes: `${sale.sale_type} Sale`,
  }

  return (
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Sales Invoice
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div className="border rounded-xl p-6">

          <h2 className="font-bold mb-3">
            Customer
          </h2>

          <p>
            {sale.customers?.business_name ??
              sale.customers?.contact_name ??
              'Walk-in Customer'}
          </p>

          <p>{sale.customers?.email}</p>

          <p>{sale.customers?.phone}</p>

        </div>

        <div className="border rounded-xl p-6">

          <h2 className="font-bold mb-3">
            Invoice
          </h2>

          <p>{sale.status}</p>

          <p>{sale.sale_type}</p>

          <p>
            {new Date(
              sale.created_at
            ).toLocaleDateString()}
          </p>

        </div>

      </div>

      <table className="w-full border rounded-xl overflow-hidden">

        <thead className="bg-slate-100">

          <tr>

            <th className="text-left p-4">
              Product
            </th>

            <th>Qty</th>

            <th>Price</th>

            <th>Total</th>

          </tr>

        </thead>

        <tbody>

          {sale.sales_order_items.map((item) => (

            <tr
              key={item.id}
              className="border-t"
            >

              <td className="p-4">
                {item.products?.name}
              </td>

              <td className="text-center">
                {item.quantity}
              </td>

              <td className="text-center">
                Rs {item.unit_price}
              </td>

              <td className="text-center">
                Rs {item.total_price}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <div className="mt-8">

        <InvoiceActions
          data={invoice}
          email={sale.customers?.email ?? undefined}
        />

      </div>

    </div>
  )
}