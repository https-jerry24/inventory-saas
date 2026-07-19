'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Sale = {
  id: string
  sale_type: string
  status: string
  total: number
  created_at: string

  customers: {
    contact_name: string
    business_name: string | null
  } | null
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSales() {
      const res = await fetch('/api/sales')
      const data = await res.json()

      setSales(data.sales ?? [])
      setLoading(false)
    }

    loadSales()
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            Sales Orders
          </h1>

          <p className="text-slate-500">
            Manage B2B & B2C sales
          </p>

        </div>

        <Link
          href="/dashboard/sales/new"
          className="bg-emerald-600 text-white px-5 py-3 rounded-xl"
        >
          New Sale
        </Link>

      </div>

      {loading ? (

        <div className="text-center py-20">
          Loading...
        </div>

      ) : sales.length === 0 ? (

        <div className="bg-white border rounded-xl p-12 text-center">

          <h2 className="text-xl font-semibold">
            No Sales Yet
          </h2>

        </div>

      ) : (

        <div className="bg-white rounded-xl border overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-4">Invoice</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>

              </tr>

            </thead>

            <tbody>

              {sales.map((sale) => (

                <tr
                  key={sale.id}
                  className="border-t hover:bg-slate-50 cursor-pointer"
                  onClick={() =>
                    window.location.href =
                      `/dashboard/sales/${sale.id}`
                  }
                >

                  <td className="p-4 font-medium">
                    {sale.id.slice(0,8)}
                  </td>

                  <td className="text-center">
                    {sale.customers?.business_name ??
                     sale.customers?.contact_name ??
                     'Walk-in'}
                  </td>

                  <td className="text-center">
                    {sale.sale_type}
                  </td>

                  <td className="text-center">
                    {sale.status}
                  </td>

                  <td className="text-center">
                    Rs {Number(sale.total).toLocaleString()}
                  </td>

                  <td className="text-center">
                    {new Date(
                      sale.created_at
                    ).toLocaleDateString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  )
}