// src/app/api/inventory/logs/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const productId = searchParams.get('productId')

  let query = supabase
    .from('inventory_logs')
    .select('*')

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data: logs, error } = await query
    .order('log_date', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    logs: logs || [],
  })
}