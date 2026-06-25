import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type OrderItem = {
  product_id: string
  quantity: number
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

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

  const tenantId = user.user_metadata?.tenant_id

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('purchase_orders')
    .select('id,status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    )
  }

  if (order.status === 'delivered') {
    return NextResponse.json(
      { error: 'Order already delivered' },
      { status: 400 }
    )
  }

  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId)

  if (itemsError) {
    return NextResponse.json(
      { error: itemsError.message },
      { status: 500 }
    )
  }

  const stockUpdates: {
    productId: string
    change: number
    newQty: number
  }[] = []

  for (const item of (items ?? []) as OrderItem[]) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, quantity_on_hand')
      .eq('id', item.product_id)
      .single()

    if (productError || !product) continue

    const qtyBefore = product.quantity_on_hand
    const qtyAfter = qtyBefore + item.quantity

    // Update stock
    const { error: updateProductError } = await supabase
      .from('products')
      .update({
        quantity_on_hand: qtyAfter,
      })
      .eq('id', item.product_id)

    if (updateProductError) {
      return NextResponse.json(
        { error: updateProductError.message },
        { status: 500 }
      )
    }

    // Inventory log
    await supabase.from('inventory_logs').insert({
      tenant_id: tenantId,
      product_id: item.product_id,
      user_id: user.id,
      change_type: 'purchase_order_delivery',
      qty_before: qtyBefore,
      qty_after: qtyAfter,
      qty_change: item.quantity,
      notes: `Purchase Order ${orderId.slice(0, 8)} delivered`,
    })

    stockUpdates.push({
      productId: item.product_id,
      change: item.quantity,
      newQty: qtyAfter,
    })
  }

  // Mark order delivered
  const { error: updateOrderError } = await supabase
    .from('purchase_orders')
    .update({
      status: 'delivered',
    })
    .eq('id', orderId)

  if (updateOrderError) {
    return NextResponse.json(
      { error: updateOrderError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: `${items?.length ?? 0} product(s) restocked successfully.`,
    stockUpdates,
  })
}