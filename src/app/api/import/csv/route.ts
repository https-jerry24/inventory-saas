// src/app/api/import/csv/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RowSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.string().transform(
    (v) => parseFloat(v.replace(/[^0-9.]/g, '')) || 0
  ),
  qty: z.string().transform(
    (v) => parseInt(v, 10) || 0
  ),
  reorder: z
    .string()
    .transform((v) => parseInt(v, 10) || 10)
    .optional(),
})

type CsvRow = {
  name: string
  sku: string
  price?: string
  qty?: string
  reorder?: string
}

type ProductInsert = {
  tenant_id: string
  name: string
  sku: string
  unit_price: number
  quantity_on_hand: number
  reorder_point: number
}

export async function POST(request: Request) {
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

  const tenantId = user.user_metadata?.tenant_id as string

  const body = await request.json()
  const rows = body.rows

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: 'No rows provided' },
      { status: 400 }
    )
  }

  const validRows: ProductInsert[] = []
  const errors: string[] = []

  rows.forEach((row: CsvRow, index: number) => {
    try {
      const parsed = RowSchema.parse(row)

      validRows.push({
        tenant_id: tenantId,
        name: parsed.name,
        sku: parsed.sku,
        unit_price: parsed.price,
        quantity_on_hand: parsed.qty,
        reorder_point: parsed.reorder || 10,
      })
    } catch {
      errors.push(
        `Row ${index + 2}: invalid data (name and SKU required)`
      )
    }
  })

  if (validRows.length === 0) {
    return NextResponse.json(
      {
        error: errors[0] || 'No valid rows',
      },
      { status: 400 }
    )
  }

  const { data: inserted, error } = await supabase
    .from('products')
    .upsert(validRows, {
      onConflict: 'sku',
      ignoreDuplicates: false,
    })
    .select()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    imported: inserted?.length || validRows.length,
    skipped: rows.length - validRows.length,
    errors: errors.slice(0, 5),
  })
}