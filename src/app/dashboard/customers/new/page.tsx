'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCustomerPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [customerType, setCustomerType] = useState<'B2B' | 'B2C'>('B2C')

  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    credit_limit: 0,
  })

  function updateField(name: string, value: string | number) {
    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
  customerType,
  businessName: form.business_name,
  contactName: form.contact_name,
  email: form.email,
  phone: form.phone,
  address: form.address,
  taxNumber: form.tax_number,
  creditLimit: Number(form.credit_limit),
}),
    })

    const data = await res.json()

    setLoading(false)

    if (!res.ok) {
      alert(data.error ?? 'Failed to create customer')
      return
    }

    router.push('/dashboard/customers')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <a
        href="/dashboard/customers"
        className="text-emerald-600 hover:text-emerald-700 font-medium"
      >
        ← Back to Customers
      </a>

      <div className="bg-white rounded-2xl border mt-5 p-8">

        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Add Customer
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Customer Type */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Customer Type
            </label>

            <select
              value={customerType}
              onChange={(e) =>
                setCustomerType(
                  e.target.value as 'B2B' | 'B2C'
                )
              }
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="B2C">B2C Customer</option>
              <option value="B2B">B2B Business</option>
            </select>

          </div>

          {customerType === 'B2B' && (

            <div>

              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Business Name
              </label>

              <input
                required
                value={form.business_name}
                onChange={(e) =>
                  updateField('business_name', e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

          )}

          <div>

            <label className="block text-sm font-semibold mb-2 text-slate-700">
              Contact Person
            </label>

            <input
              required
              value={form.contact_name}
              onChange={(e) =>
                updateField('contact_name', e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField('email', e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            <div>

              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Phone
              </label>

              <input
                value={form.phone}
                onChange={(e) =>
                  updateField('phone', e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm font-semibold mb-2 text-slate-700">
              Address
            </label>

            <textarea
              rows={3}
              value={form.address}
              onChange={(e) =>
                updateField('address', e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

          {customerType === 'B2B' && (

            <>

              <div>

                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Tax Number
                </label>

                <input
                  value={form.tax_number}
                  onChange={(e) =>
                    updateField('tax_number', e.target.value)
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Credit Limit
                </label>

                <input
                  type="number"
                  value={form.credit_limit}
                  onChange={(e) =>
                    updateField(
                      'credit_limit',
                      Number(e.target.value)
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />

              </div>

            </>

          )}

          <button
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold"
          >
            {loading
              ? 'Saving...'
              : 'Create Customer'}
          </button>

        </form>

      </div>

    </div>
  )
}