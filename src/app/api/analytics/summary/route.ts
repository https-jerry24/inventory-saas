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

  const { data: products, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const totalProducts = products?.length || 0

  const totalValue =
    products?.reduce(
      (sum, p) =>
        sum +
        Number(p.unit_price || 0) *
          Number(p.quantity_on_hand || 0),
      0
    ) || 0

  const lowStockCount =
    products?.filter(
      (p) =>
        Number(p.quantity_on_hand || 0) <=
        Number(p.reorder_point || 0)
    ).length || 0

  return NextResponse.json({
    totalProducts,
    totalValue,
    lowStockCount,
  })
}