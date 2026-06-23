// src/app/api/products/[id]/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  quantityOnHand: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
})

// GET SINGLE PRODUCT

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id,name),
      suppliers(id,name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    product: data,
  })
}

// UPDATE PRODUCT

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

    const data = UpdateSchema.parse(body)

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: data.name,
        sku: data.sku,
        unit_price: data.unitPrice,
        quantity_on_hand: data.quantityOnHand,
        reorder_point: data.reorderLevel,
        category_id: data.categoryId,
        supplier_id: data.supplierId,
        image_url: data.imageUrl,
        barcode: data.barcode,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      product,
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues[0]?.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error' },
      { status: 400 }
    )
  }
}

// DELETE PRODUCT

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
  })
}