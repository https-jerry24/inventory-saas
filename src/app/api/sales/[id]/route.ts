import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    .from('sales_orders')
    .select(`
      *,
      customers (
        id,
        contact_name,
        business_name,
        email,
        phone
      ),
      sales_order_items (
        id,
        quantity,
        unit_price,
        total_price,
        products (
          id,
          name,
          sku
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)

    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}