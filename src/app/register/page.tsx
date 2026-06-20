// src/app/register/page.tsx

'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    password: '',
    yourName: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>

        <p className="text-slate-500 mb-8">
          Set up your company inventory system
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Company Name"
            value={form.companyName}
            onChange={(e) =>
              setForm({
                ...form,
                companyName: e.target.value,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Your Name"
            value={form.yourName}
            onChange={(e) =>
              setForm({
                ...form,
                yourName: e.target.value,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}