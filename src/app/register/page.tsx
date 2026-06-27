'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    companyName: '',
    email:       '',
    password:    '',
    yourName:    '',
  })
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
      } else {
        setSuccess('Account created! Check your email, then log in.')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#060E09' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SF</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            StockFlow
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-7 shadow-2xl shadow-black/40">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">
            Create account
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Set up your company inventory system
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2.5 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2.5 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {[
              { field: 'yourName',    placeholder: 'Your full name',    type: 'text'     },
              { field: 'companyName', placeholder: 'Company name',      type: 'text'     },
              { field: 'email',       placeholder: 'Work email',        type: 'email'    },
              { field: 'password',    placeholder: 'Password (8+ chars)', type: 'password' },
            ].map(({ field, placeholder, type }) => (
              <input
                key={field}
                type={type}
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            ))}
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </a>
          </p>
        </div>

        <p className="text-center text-slate-700 text-xs mt-5">
          Cloud-Based Multi-Tenant SaaS Inventory System
        </p>
      </div>
    </div>
  )
}