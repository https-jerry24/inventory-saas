'use client'

import { useEffect, useMemo, useState } from 'react'

type Customer = {
  id: string
  customer_type: 'B2B' | 'B2C'
  business_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  address: string | null
  tax_number: string | null
  credit_limit: number
}

type ApiResponse = {
  customers: Customer[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then((data: ApiResponse) => {
        setCustomers(data.customers ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const text = (
        (c.business_name ?? '') +
        ' ' +
        c.contact_name +
        ' ' +
        (c.email ?? '')
      ).toLowerCase()

      return text.includes(search.toLowerCase())
    })
  }, [customers, search])

  const totalCustomers = customers.length

  const totalB2B = customers.filter(
    c => c.customer_type === 'B2B'
  ).length

  const totalB2C = customers.filter(
    c => c.customer_type === 'B2C'
  ).length

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Customers
          </h1>

          <p className="text-slate-500 mt-1">
            Manage your business and retail customers.
          </p>
        </div>

        <a
          href="/dashboard/customers/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
        >
          + Add Customer
        </a>

      </div>

      {/* Statistics */}

      <div className="grid md:grid-cols-3 gap-5 mb-8">

        <div className="bg-white border rounded-2xl p-5">

          <p className="text-slate-500 text-sm">
            Total Customers
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {totalCustomers}
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-5">

          <p className="text-slate-500 text-sm">
            B2B Companies
          </p>

          <h2 className="text-3xl font-bold text-blue-700 mt-2">
            {totalB2B}
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-5">

          <p className="text-slate-500 text-sm">
            B2C Customers
          </p>

          <h2 className="text-3xl font-bold text-emerald-700 mt-2">
            {totalB2C}
          </h2>

        </div>

      </div>

      {/* Search */}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers..."
        className="w-full border rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-emerald-500 outline-none"
      />

      {loading ? (

        <div className="text-slate-500">
          Loading customers...
        </div>

      ) : filtered.length === 0 ? (

        <div className="bg-white border rounded-2xl p-12 text-center">

          <h3 className="font-semibold text-slate-800 text-lg">
            No customers found
          </h3>

          <p className="text-slate-500 mt-2">
            Add your first customer.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {filtered.map(customer => (

            <div
              key={customer.id}
              className="bg-white border rounded-2xl p-6 hover:shadow-md transition"
            >

              <div className="flex justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <h2 className="font-bold text-xl text-slate-900">

                      {customer.customer_type === 'B2B'
                        ? customer.business_name
                        : customer.contact_name}

                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        customer.customer_type === 'B2B'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {customer.customer_type}
                    </span>

                  </div>

                  {customer.customer_type === 'B2B' && (

                    <p className="text-slate-600 mt-1">

                      Contact: {customer.contact_name}

                    </p>

                  )}

                  <p className="text-slate-500 mt-2">

                    {customer.email}

                  </p>

                  <p className="text-slate-500">

                    {customer.phone}

                  </p>

                  {customer.address && (

                    <p className="text-slate-500">

                      {customer.address}

                    </p>

                  )}

                  {customer.customer_type === 'B2B' && (

                    <div className="mt-3 flex gap-6 text-sm">

                      <span>

                        <strong>Tax:</strong>{' '}
                        {customer.tax_number ?? '-'}

                      </span>

                      <span>

                        <strong>Credit:</strong>{' '}
                        Rs.{' '}
                        {Number(customer.credit_limit).toLocaleString()}

                      </span>

                    </div>

                  )}

                </div>

                <div className="flex flex-col gap-2">

                  <div className="flex gap-2">

<a
href={`/dashboard/customers/${customer.id}`}
className="text-blue-600 hover:underline"
>
View
</a>

<a
href={`/dashboard/customers/${customer.id}/edit`}
className="text-emerald-600 hover:underline"
>
Edit
</a>

</div>

                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}