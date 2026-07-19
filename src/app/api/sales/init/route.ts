import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data: customers } = await supabase
    .from('customers')
    .select('id,contact_name,business_name,customer_type,email')

  const { data: products } = await supabase
    .from('products')
    .select('id,name,sku,unit_price,quantity_on_hand')
    .order('name')

  return NextResponse.json({
    customers: customers ?? [],
    products: products ?? [],
  })
}