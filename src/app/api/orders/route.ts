// src/app/api/orders/route.ts 
// GET all orders, POST create new order 
  
import { NextResponse }  from 'next/server' 
import { createClient }  from '@/lib/supabase/server' 
import { z }             from 'zod' 
  
const OrderSchema = z.object({ 
  supplierId:  z.string().uuid('Invalid supplier'), 
  expectedAt:  z.string().optional(), 
  items: z.array(z.object({ 
    productId: z.string().uuid(), 
    quantity:  z.number().int().min(1), 
    unitCost:  z.number().min(0), 
  })).min(1, 'Add at least one product'), 
}) 
  
// ── GET: list all purchase orders ──────────────────────── 
export async function GET() { 
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser() 
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 
}) 
  
  const { data: orders, error } = await supabase 
    .from('purchase_orders') 
    .select(` 
      id, status, expected_at, created_at, 
      suppliers (id, name), 
      purchase_order_items ( 
        id, quantity, unit_cost, 
        products (id, name, sku) 
      ) 
    `) 
    .order('created_at', { ascending: false }) 
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 
}) 

  return NextResponse.json({ orders }) 
} 
  
// ── POST: create new purchase order ────────────────────── 
export async function POST(request: Request) { 
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser() 
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 
}) 
  
  try { 
    const body = await request.json() 
    const { supplierId, expectedAt, items } = OrderSchema.parse(body) 
    const tenantId = user.user_metadata?.tenant_id 
  
    // Step 1: Calculate order total
const totalAmount = items.reduce(
  (sum, item) => sum + item.quantity * item.unitCost,
  0
)

// Step 2: Create the order header
const { data: order } = await supabase
  .from('purchase_orders')
  .insert({
    tenant_id: tenantId,
    supplier_id: supplierId,
    status: 'draft',
    expected_at: expectedAt || null,
    total_amount: totalAmount,
  })
  .select()
  .single()
  
    // Step 2: Insert all line items 
   const lineItems = items.map((item) => ({
      order_id:   order.id, 
      product_id: item.productId, 
      quantity:   item.quantity, 
      unit_cost:  item.unitCost, 
    })) 
  
    const { error: itemsErr } = await supabase 
      .from('purchase_order_items') 
      .insert(lineItems) 
  
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { 
status: 400 }) 
  
    return NextResponse.json({ order }, { status: 201 }) 
  } catch (error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? 'Validation error' },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
} 