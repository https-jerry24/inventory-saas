'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditCustomer({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()

  const [form, setForm] = useState({
    customer_type: '',
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    credit_limit: 0,
  })

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data.customer)
      })
  }, [params.id])

  async function save(e: React.FormEvent) {
    e.preventDefault()

    await fetch(`/api/customers/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mt-5">

        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Edit Customer
        </h1>

        <form
          onSubmit={save}
          className="space-y-5"
        >

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Customer Type
            </label>

            <select
              value={form.customer_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  customer_type: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Business Name
            </label>

            <input
              value={form.business_name ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  business_name: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              placeholder="Business Name"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Contact Person
            </label>

            <input
              value={form.contact_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact_name: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              value={form.email ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Phone
            </label>

            <input
              value={form.phone ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Address
            </label>

            <textarea
              rows={4}
              value={form.address ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Tax Number
            </label>

            <input
              value={form.tax_number ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  tax_number: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Credit Limit
            </label>

            <input
              type="number"
              value={form.credit_limit}
              onChange={(e) =>
                setForm({
                  ...form,
                  credit_limit: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Save Changes
          </button>

        </form>

      </div>

    </div>
  )
}