// src/app/api/products/route.ts
// Handles GET (list) and POST (create) for /api/products

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// ── GET: Fetch all products for current tenant ──────────
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)

  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'created_at'

  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      sku,
      barcode,
      unit_price,
      quantity_on_hand,
      reorder_point,
      created_at,
      categories (
        id,
        name
      ),
      suppliers (
        id,
        name
      )
    `)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (sortBy === 'name') {
    query = query.order('name', { ascending: true })
  } 
  else if (sortBy === 'price') {
    query = query.order('unit_price', { ascending: true })
  } 
  else {
    query = query.order('created_at', { ascending: false })
  }

  const {
    data: products,
    error,
  } = await query

  return NextResponse.json({
    userTenant: user.user_metadata?.tenant_id,
    count: products?.length ?? 0,
    products,
    error,
  })
}
// ── POST: Create a new product ──────────────────────────
const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  unitPrice: z.number().min(0, 'Price must be 0 or more'),
  quantityOnHand: z.number().int().min(0),
  reorderLevel: z.number().int().min(0).default(10),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
})

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

  try {
    const body = await request.json()
    const data = CreateProductSchema.parse(body)

    const tenantId = user.user_metadata?.tenant_id

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        unit_price: data.unitPrice,
        quantity_on_hand: data.quantityOnHand,
        reorder_point: data.reorderLevel,
        category_id: data.categoryId,
        supplier_id: data.supplierId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { product },
      { status: 201 }
    )
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
  return NextResponse.json(
    { error: e.issues[0].message },
    { status: 400 }
  )
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
    
  }
  
}