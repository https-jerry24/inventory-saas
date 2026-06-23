// src/app/dashboard/suppliers/page.tsx

'use client'

import { useState, useEffect } from 'react'

type Supplier = {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
}

type SupplierForm = {
  name: string
  email: string
  phone: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [form, setForm] = useState<SupplierForm>({
    name: '',
    email: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  async function fetchSuppliers() {
    try {
      const res = await fetch('/api/suppliers')
      const data = await res.json()

      setSuppliers(data.suppliers || [])
    } catch {
      setMsg('Failed to load suppliers')
    }
  }

  async function handleAdd() {
    if (!form.name.trim()) {
      setMsg('Name is required')
      return
    }

    setLoading(true)
    setMsg('')

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.error || 'Failed to add supplier')
        setLoading(false)
        return
      }

      setMsg('Supplier added!')

      setForm({
        name: '',
        email: '',
        phone: '',
      })

      fetchSuppliers()

    } catch {
      setMsg('Something went wrong')
    }

    setLoading(false)
  }


  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Suppliers
      </h1>


      {/* Add Supplier Form */}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

        <h2 className="font-semibold mb-4">
          Add New Supplier
        </h2>


        {msg && (
          <div
            className={`px-4 py-3 rounded-lg mb-4 text-sm ${
              msg.includes('added')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {msg}
          </div>
        )}


        <div className="grid grid-cols-3 gap-3">

          <input
            placeholder="Supplier Name *"
            value={form.name}
            onChange={(e) =>
              setForm(prev => ({
                ...prev,
                name: e.target.value
              }))
            }
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />


          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm(prev => ({
                ...prev,
                email: e.target.value
              }))
            }
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />


          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm(prev => ({
                ...prev,
                phone: e.target.value
              }))
            }
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />

        </div>


        <button
          onClick={handleAdd}
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : '+ Add Supplier'}
        </button>

      </div>



      {/* Suppliers Table */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-slate-50">

            <tr>

              {[
                'Supplier Name',
                'Email',
                'Phone',
                'Added'
              ].map((h) => (

                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold text-slate-600"
                >
                  {h}
                </th>

              ))}

            </tr>

          </thead>


          <tbody>

            {suppliers.length === 0 ? (

              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No suppliers yet
                </td>
              </tr>


            ) : (

              suppliers.map((s, i) => (

                <tr
                  key={s.id}
                  className={`border-t border-slate-100 ${
                    i % 2 === 0 ? '' : 'bg-slate-50'
                  }`}
                >

                  <td className="px-4 py-3 font-medium">
                    {s.name}
                  </td>


                  <td className="px-4 py-3 text-slate-500">
                    {s.email || '—'}
                  </td>


                  <td className="px-4 py-3 text-slate-500">
                    {s.phone || '—'}
                  </td>


                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(
                      s.created_at
                    ).toLocaleDateString()}
                  </td>


                </tr>

              ))

            )}

          </tbody>


        </table>

      </div>


    </div>
  )
}