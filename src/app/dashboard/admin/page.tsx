'use client'

import { useEffect, useState } from 'react'

type Tenant = {
  id:            string
  name:          string
  slug:          string
  plan:          string
  product_count: number
  user_count:    number
  total_value:   number
  created_at:    string
}

const PLAN_STYLES: Record<string, string> = {
  free:       'bg-slate-100   text-slate-600',
  pro:        'bg-emerald-100 text-emerald-700',
  enterprise: 'bg-purple-100  text-purple-700',
  superadmin: 'bg-red-100     text-red-700',
}

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function loadTenants() {
      try {
        const res  = await fetch('/api/admin/tenants')
        const data = await res.json()
        if (data.error) setError(data.error)
        else setTenants(data.tenants ?? [])
      } catch {
        setError('Failed to load tenants')
      } finally {
        setLoading(false)
      }
    }
    loadTenants()
  }, [])

  const totalValue    = tenants.reduce((s, t) => s + Number(t.total_value),  0)
  const totalProducts = tenants.reduce((s, t) => s + t.product_count,        0)
  const totalUsers    = tenants.reduce((s, t) => s + t.user_count,           0)

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <h2 className="text-slate-900 font-semibold mb-1">Access Denied</h2>
          <p className="text-red-700 text-sm">{error}</p>
          <p className="text-red-500 text-xs mt-2">
            This page requires role: superadmin
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
            SUPER ADMIN
          </span>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Tenant Management
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Platform overview — all tenants sharing one PostgreSQL database ·{' '}
          <code className="font-mono text-xs bg-slate-100 px-1 rounded">
            prisma.$queryRaw
          </code>{' '}
          bypasses RLS for admin view
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ borderTop:'3px solid #7C3AED' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Total Tenants</p>
          <p className="text-3xl font-semibold text-purple-700">{tenants.length}</p>
          <p className="text-xs text-slate-400 mt-1">Companies on this platform</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ borderTop:'3px solid #059669' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Total Products</p>
          <p className="text-3xl font-semibold text-emerald-700">{totalProducts}</p>
          <p className="text-xs text-slate-400 mt-1">{totalUsers} users across all tenants</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ borderTop:'3px solid #059669' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Platform Value</p>
          <p className="text-3xl font-semibold text-emerald-700">
            Rs. {Math.round(totalValue).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Combined inventory value</p>
        </div>
      </div>

      {/* Tenants Table */}
      {loading ? (
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading tenants…</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-900 text-sm">
              All Tenants — {tenants.length} companies
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Shared PostgreSQL database · isolated by Row-Level Security
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Company','Slug','Plan','Products','Users','Inventory Value','Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant, i) => (
                  <tr
                    key={tenant.id}
                    className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">{tenant.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{tenant.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PLAN_STYLES[tenant.plan] ?? PLAN_STYLES.free}`}>
                        {tenant.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{tenant.product_count}</td>
                    <td className="px-4 py-3 text-slate-600">{tenant.user_count}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      Rs. {Math.round(Number(tenant.total_value)).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Architecture Note */}
      <div className="mt-5 bg-purple-50 border border-purple-100 rounded-xl p-5">
        <h3 className="font-semibold text-purple-900 text-sm mb-1">
          Multi-Tenancy Architecture Proof
        </h3>
        <p className="text-purple-800 text-xs leading-relaxed">
          All {tenants.length} tenants above share ONE PostgreSQL database and ONE Next.js application.
          Data isolation is enforced by Row-Level Security at the database engine level.
          This Super Admin view uses <code className="font-mono bg-purple-100 px-1 rounded">prisma.$queryRaw</code> to
          bypass RLS — regular tenant users can never access this page.
        </p>
      </div>
    </div>
  )
}