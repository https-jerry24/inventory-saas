'use client'

import { useState, useEffect } from 'react'

type Supplier     = { id: string; name: string; email: string | null; phone: string | null; created_at: string }
type SupplierForm = { name: string; email: string; phone: string }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [form,      setForm]      = useState<SupplierForm>({ name:'', email:'', phone:'' })
  const [loading,   setLoading]   = useState(false)
  const [msg,       setMsg]       = useState('')

  useEffect(() => { fetchSuppliers() }, [])

  async function fetchSuppliers() {
    try {
      const res  = await fetch('/api/suppliers')
      const data = await res.json()
      setSuppliers(data.suppliers || [])
    } catch { setMsg('Failed to load suppliers') }
  }

  async function handleAdd() {
    if (!form.name.trim()) { setMsg('Name is required'); return }
    setLoading(true); setMsg('')
    try {
      const res  = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Failed to add supplier'); setLoading(false); return }
      setMsg('Supplier added!')
      setForm({ name:'', email:'', phone:'' })
      fetchSuppliers()
    } catch { setMsg('Something went wrong') }
    setLoading(false)
  }

  const inputCls = "border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition"

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-6">Suppliers</h1>

      {/* Add Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <h2 className="font-semibold text-slate-900 text-sm mb-4">Add New Supplier</h2>

        {msg && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm border ${
            msg.includes('added')
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-3">
          <input
            placeholder="Supplier Name *"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            className={inputCls}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            className={inputCls}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
            className={inputCls}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding…' : '+ Add Supplier'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Supplier Name','Email','Phone','Added'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-sm">
                  No suppliers yet — add one above
                </td>
              </tr>
            ) : (
              suppliers.map((s, i) => (
                <tr key={s.id} className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                    {new Date(s.created_at).toLocaleDateString()}
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