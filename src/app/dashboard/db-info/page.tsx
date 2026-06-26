'use client'

import { useEffect, useState } from 'react'

type RLSPolicy = {
  table_name: string
  policy_name: string
  operation: string
  using_expression: string | null
}

type Partition = {
  partition_name: string
  partition_range: string
  partition_size: string
}

type TableCount = {
  table_name: string
  estimated_rows: number
}

type RLSEnabled = {
  table_name: string
  rls_enabled: boolean
}

type DBInfoResponse = {
  rlsPolicies: RLSPolicy[]
  partitions: Partition[]
  tableCounts: TableCount[]
  tenantCount: number
  rlsEnabled: RLSEnabled[]
  error?: string
}

const OP_COLORS: Record<string, string> = {
  SELECT: 'bg-green-100 text-green-700',
  INSERT: 'bg-blue-100 text-blue-700',
  UPDATE: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  ALL: 'bg-purple-100 text-purple-700',
}

function ConceptBadge({
  label,
}: {
  label: string
}) {
  return (
    <span className="mr-2 mb-1 inline-block rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">
      CONCEPT DEMONSTRATED: {label}
    </span>
  )
}

export default function DBInfoPage() {
  const [data, setData] =
    useState<DBInfoResponse | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/db/info')
        const result: DBInfoResponse =
          await response.json()

        setData(result)
      } catch {
        setData({
          rlsPolicies: [],
          partitions: [],
          tableCounts: [],
          tenantCount: 0,
          rlsEnabled: [],
          error: 'Failed to load data',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-slate-400">
        Querying PostgreSQL system tables...
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="p-6 text-red-500">
        Error: {data?.error}
      </div>
    )
  }

  const {
    rlsPolicies,
    partitions,
    tableCounts,
    tenantCount,
    rlsEnabled,
  } = data

  const rlsEnabledCount = rlsEnabled.filter(
    (table) => table.rls_enabled
  ).length

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">
        Database Concepts — Live Proof
      </h1>

      <p className="mb-8 text-slate-500">
        Live data from PostgreSQL system tables.
      </p>

      {/* RLS */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <ConceptBadge label="Row-Level Security" />

        <h2 className="mt-3 mb-1 text-xl font-bold">
          Row-Level Security Policies
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          {rlsPolicies.length} policies across{' '}
          {rlsEnabledCount} tables.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  Table
                </th>
                <th className="px-3 py-2 text-left">
                  Policy
                </th>
                <th className="px-3 py-2 text-left">
                  Operation
                </th>
                <th className="px-3 py-2 text-left">
                  Expression
                </th>
              </tr>
            </thead>

            <tbody>
              {rlsPolicies.map((policy, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-100"
                >
                  <td className="px-3 py-2 font-mono">
                    {policy.table_name}
                  </td>

                  <td className="px-3 py-2">
                    {policy.policy_name}
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        OP_COLORS[
                          policy.operation
                        ] ?? ''
                      }`}
                    >
                      {policy.operation}
                    </span>
                  </td>

                  <td className="px-3 py-2 font-mono text-teal-700">
                    {policy.using_expression}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partitions */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <ConceptBadge label="Table Partitioning" />

        <h2 className="mt-3 mb-1 text-xl font-bold">
          Inventory Log Partitions
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {partitions.map((partition, index) => (
            <div
              key={index}
              className="rounded-xl border border-teal-200 bg-teal-50 p-3"
            >
              <p className="font-mono font-bold text-teal-900">
                {partition.partition_name}
              </p>

              <p className="mt-1 text-xs text-teal-600">
                {partition.partition_range}
              </p>

              <p className="mt-1 text-xs text-teal-400">
                Size: {partition.partition_size}
              </p>
            </div>
          ))}

          {partitions.length === 0 && (
            <p className="col-span-3 text-slate-400">
              No partitions found.
            </p>
          )}
        </div>
      </div>

      {/* Multi-Tenancy */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <ConceptBadge label="Multi-Tenancy" />

        <h2 className="mt-3 mb-1 text-xl font-bold">
          Multi-Tenant Architecture
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          {tenantCount} tenants share this
          database.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">
                  Table
                </th>
                <th className="px-4 py-2 text-left">
                  Rows
                </th>
                <th className="px-4 py-2 text-left">
                  RLS
                </th>
              </tr>
            </thead>

            <tbody>
              {tableCounts.map((table, index) => {
                const rls = rlsEnabled.find(
                  (item) =>
                    item.table_name ===
                    table.table_name
                )

                return (
                  <tr
                    key={index}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-2 font-mono">
                      {table.table_name}
                    </td>

                    <td className="px-4 py-2 font-bold">
                      {Number(
                        table.estimated_rows
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          rls?.rls_enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {rls?.rls_enabled
                          ? 'YES'
                          : 'NO'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replication */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <ConceptBadge label="Replication" />

        <h2 className="mt-3 mb-3 text-xl font-bold">
          Database Replication
        </h2>

        <p className="mb-6 text-sm text-slate-500">
          Supabase uses replication for
          availability and read scaling.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-bold text-blue-900">
              Primary Database
            </p>

            <p className="mt-2 text-sm text-blue-700">
              INSERT / UPDATE / DELETE
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
            <p className="font-bold text-purple-900">
              Read Replica
            </p>

            <p className="mt-2 text-sm text-purple-700">
              SELECT / Analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}