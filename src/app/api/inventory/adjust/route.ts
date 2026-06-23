// src/app/api/inventory/adjust/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const AdjustSchema = z.object({
  productId: z.string().uuid(),
  changeQty: z.number().int(),
  reason: z.string().min(1, 'Reason is required'),
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

    const { productId, changeQty, reason } =
      AdjustSchema.parse(body)

    const tenantId = user.user_metadata?.tenant_id

    const { data: product, error: fetchErr } =
      await supabase
        .from('products')
        .select(
          `
          id,
          name,
          quantity_on_hand,
          reorder_point
        `
        )
        .eq('id', productId)
        .single()

    if (fetchErr || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const oldQty = product.quantity_on_hand
    const newQty = oldQty + changeQty

    if (newQty < 0) {
      return NextResponse.json(
        {
          error: `Cannot remove ${Math.abs(
            changeQty
          )} units. Only ${oldQty} in stock.`,
        },
        { status: 400 }
      )
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({
        quantity_on_hand: newQty,
      })
      .eq('id', productId)

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message },
        { status: 500 }
      )
    }

    const { error: logErr } = await supabase
      .from('inventory_logs')
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        user_id: user.id,
        change_type:
          changeQty > 0 ? 'stock_in' : 'stock_out',
        qty_before: oldQty,
        qty_after: newQty,
        qty_change: changeQty,
        notes: reason,
      })

    if (logErr) {
      console.error(
        'Inventory log failed:',
        logErr.message
      )
    }

    return NextResponse.json({
      success: true,
      productName: product.name,
      changeQty,
      oldQty,
      newQty,
      isLowStock:
        newQty <= product.reorder_point,
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: e.issues[0]?.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error' },
      { status: 400 }
    )
  }
}