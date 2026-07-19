'use client'

import { useEffect, useState } from 'react'

type Customer = {
  id: string
  customer_type: string
  business_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  address: string | null
  tax_number: string | null
  credit_limit: number
}

export default function CustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then(r => r.json())
      .then(data => setCustomer(data.customer))
  }, [params.id])

  if (!customer)
    return <p className="p-6">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">

      <a
        href="/dashboard/customers"
        className="text-emerald-600"
      >
        ← Back
      </a>

      <div className="bg-white rounded-xl border p-8 mt-5">

        <h1 className="text-3xl font-bold mb-6 text-slate-900">
          Customer Details
        </h1>

        <div className="space-y-4">

          <p><strong>Type:</strong> {customer.customer_type}</p>

          {customer.business_name && (
            <p><strong>Business:</strong> {customer.business_name}</p>
          )}

          <p><strong>Name:</strong> {customer.contact_name}</p>

          <p><strong>Email:</strong> {customer.email}</p>

          <p><strong>Phone:</strong> {customer.phone}</p>

          <p><strong>Address:</strong> {customer.address}</p>

          {customer.tax_number && (
            <p><strong>Tax No:</strong> {customer.tax_number}</p>
          )}

          <p><strong>Credit Limit:</strong> Rs. {customer.credit_limit}</p>

        </div>

        <div className="flex gap-3 mt-8">

          <a
            href={`/dashboard/customers/${customer.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </a>

          <button
            onClick={async () => {

              if (!confirm('Delete customer?')) return

              await fetch(`/api/customers/${customer.id}`, {
                method: 'DELETE',
              })

              window.location.href = '/dashboard/customers'

            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  )
}