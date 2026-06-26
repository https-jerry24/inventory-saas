import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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
  estimated_rows: bigint
}

type TenantCount = {
  count: bigint
}

type RLSEnabled = {
  table_name: string
  rls_enabled: boolean
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const role = user.user_metadata?.role

    if (
      role !== 'admin' &&
      role !== 'superadmin'
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // RLS Policies
    const rlsPolicies = await prisma.$queryRaw<RLSPolicy[]>`
      SELECT
        tablename AS table_name,
        policyname AS policy_name,
        cmd AS operation,
        qual AS using_expression
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, cmd
    `

    // Partitions (safe if none exist)
    let partitions: Partition[] = []

    try {
      partitions = await prisma.$queryRaw<Partition[]>`
        SELECT
          child.relname AS partition_name,
          pg_get_expr(
            child.relpartbound,
            child.oid,
            true
          ) AS partition_range,
          pg_size_pretty(
            pg_relation_size(child.oid)
          ) AS partition_size
        FROM pg_inherits
        JOIN pg_class parent
          ON pg_inherits.inhparent = parent.oid
        JOIN pg_class child
          ON pg_inherits.inhrelid = child.oid
        WHERE parent.relname = 'inventory_logs'
        ORDER BY child.relname
      `
    } catch {
      partitions = []
    }

    // Table row counts
    const tableCounts = await prisma.$queryRaw<TableCount[]>`
      SELECT
        relname AS table_name,
        n_live_tup AS estimated_rows
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      AND relname IN (
        'products',
        'tenants',
        'users',
        'categories',
        'suppliers',
        'purchase_orders',
        'audit_logs'
      )
      ORDER BY n_live_tup DESC
    `

    // Tenant count
    const tenantCount = await prisma.$queryRaw<TenantCount[]>`
      SELECT COUNT(*) AS count
      FROM tenants
    `

    // RLS enabled tables
    const rlsEnabled = await prisma.$queryRaw<RLSEnabled[]>`
      SELECT
        relname AS table_name,
        relrowsecurity AS rls_enabled
      FROM pg_class
      JOIN pg_namespace
        ON pg_namespace.oid = pg_class.relnamespace
      WHERE nspname = 'public'
      AND relkind = 'r'
      ORDER BY relname
    `

    const safeTableCounts = tableCounts.map((table) => ({
  ...table,
  estimated_rows: Number(table.estimated_rows),
}))

return NextResponse.json({
  rlsPolicies,
  partitions,
  tableCounts: safeTableCounts,
  tenantCount: Number(
    tenantCount[0]?.count ?? 0
  ),
  rlsEnabled,
})
  } catch (error) {
    console.error('DB Info API Error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      {
        status: 500,
      }
    )
  }
}