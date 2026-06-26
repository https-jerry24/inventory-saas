'use client'

import { useEffect, useState } from 'react'

type Tenant = {
  id: string
  name: string
  slug: string
  plan: string
  product_count: number
  user_count: number
  total_value: number
  created_at: string
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  pro: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
  superadmin: 'bg-red-100 text-red-700',
}

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const response = await fetch('/api/admin/tenants')
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setTenants(data.tenants ?? [])
        }
      } catch {
        setError('Failed to load tenants')
      } finally {
        setLoading(false)
      }
    }

    loadTenants()
  }, [])

  const totalValue = tenants.reduce(
    (sum, tenant) => sum + Number(tenant.total_value),
    0
  )

  const totalProducts = tenants.reduce(
    (sum, tenant) => sum + tenant.product_count,
    0
  )

  const totalUsers = tenants.reduce(
    (sum, tenant) => sum + tenant.user_count,
    0
  )

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 p-6 text-red-700">
          <h2 className="mb-2 text-lg font-bold">Access Denied</h2>

          <p>{error}</p>

          <p className="mt-2 text-sm text-red-500">
            This page is only accessible to users with the
            superadmin role.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
            SUPER ADMIN
          </span>

          <h1 className="text-3xl font-bold text-slate-900">
            Tenant Management
          </h1>
        </div>

        <p className="text-slate-500">
          Platform overview — all tenants sharing this database
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-purple-50 p-6">
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
            Total Tenants
          </p>

          <p className="text-3xl font-bold text-purple-700">
            {tenants.length}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-6">
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
            Total Products
          </p>

          <p className="text-3xl font-bold text-blue-700">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl bg-green-50 p-6">
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
            Platform Inventory
          </p>

          <p className="text-3xl font-bold text-green-700">
            Rs. {Math.round(totalValue).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="animate-pulse text-slate-500">
            Loading tenants...
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              All Tenants — {tenants.length} companies
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Shared PostgreSQL database with Row-Level Security
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Products
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Users
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Inventory Value
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>
                {tenants.map((tenant, index) => (
                  <tr
                    key={tenant.id}
                    className={`border-t border-slate-100 ${
                      index % 2 === 0 ? '' : 'bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {tenant.name}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {tenant.slug}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          PLAN_COLORS[tenant.plan] ??
                          PLAN_COLORS.free
                        }`}
                      >
                        {tenant.plan.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-bold text-blue-700">
                      {tenant.product_count}
                    </td>

                    <td className="px-4 py-3">
                      {tenant.user_count}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      Rs.{' '}
                      {Math.round(
                        Number(tenant.total_value)
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(
                        tenant.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-5">
        <h3 className="mb-2 font-semibold text-purple-900">
          Multi-Tenancy Architecture
        </h3>

        <p className="text-sm text-purple-800">
          All tenants share one PostgreSQL database and one
          Next.js application. Data isolation is enforced by
          PostgreSQL Row-Level Security policies.
        </p>
      </div>
    </div>
  )
}