// src/app/api/products/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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

  const tenantId = user.user_metadata?.tenant_id

  const products = await prisma.products.findMany({
    where: {
      tenant_id: tenantId,
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return NextResponse.json({
    products,
    tenantId,
  })
}