import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SaleSchema = z.object({
  saleType: z.enum(['B2B', 'B2C']),
  customerId: z.string().nullable(),
  paymentMethod: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number(),
    })
  ),
})

/* ===========================
   GET SALES
=========================== */

export async function GET() {
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
    .from('sales_orders')
    .select(`
      *,
      customers(
        contact_name,
        business_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    sales: data,
  })
}

/* ===========================
   CREATE SALE
=========================== */


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

    const sale = SaleSchema.parse(body)

    const tenantId = user.user_metadata.tenant_id

    const subtotal = sale.items.reduce(
      (sum, item) =>
        sum + item.quantity * item.unitPrice,
      0
    )

    //----------------------------------
    // Create Order
    //----------------------------------

    const { data: order, error: orderError } =
      await supabase
        .from('sales_orders')
        .insert({
          tenant_id: tenantId,
          customer_id: sale.customerId,
          sale_type: sale.saleType,
          payment_method: sale.paymentMethod,
          subtotal,
          total: subtotal,
        })
        .select()
        .single()

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message },
        { status: 400 }
      )
    }

    //----------------------------------
    // Items
    //----------------------------------

    const orderItems = sale.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price:
        item.quantity * item.unitPrice,
    }))

    const {
  data: insertedItems,
  error: itemsError,
} = await supabase
  .from('sales_order_items')
  .insert(orderItems)
  .select()

console.log('Items:', insertedItems)
console.log('Items Error:', itemsError)

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 400 }
      )
    }

    //----------------------------------
    // Deduct Stock
    //----------------------------------

    for (const item of sale.items) {
      const { data: product } =
        await supabase
          .from('products')
          .select(
            'id,name,quantity_on_hand'
          )
          .eq('id', item.productId)
          .single()

      if (!product) continue

      const newQty =
        product.quantity_on_hand -
        item.quantity

      const { error: updateError } = await supabase
  .from('products')
  .update({
    quantity_on_hand: newQty,
  })
  .eq('id', item.productId)

console.log('Product Update Error:', updateError)
      //--------------------------------
      // Inventory Log
      //--------------------------------

      const { error: logError } = await supabase
  .from('inventory_logs')
  .insert({
    tenant_id: tenantId,
    product_id: item.productId,
    user_id: user.id,
    change_type: 'sale',
    qty_before: product.quantity_on_hand,
    qty_after: newQty,
    qty_change: -item.quantity,
    notes: `Sale ${order.id.slice(0,8)}`
  })

console.log('Inventory Log Error:', logError)
    }

    return NextResponse.json({
  success: true,
  order,
})
  } catch (err) {
  console.error(err)

  return NextResponse.json(
    {
      error: String(err),
    },
    {
      status: 500,
    }
  )
}
}