import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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

    console.log('USER:', user)
console.log('USER METADATA:', user.user_metadata)
console.log('ROLE:', user.user_metadata?.role)

const role = user.user_metadata?.role

    if (role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin only' },
        { status: 403 }
      )
    }

    const tenants = await prisma.tenants.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        products: true,
        users: true,
      },
    })

    const formattedTenants = tenants.map((tenant) => {
      const totalValue = tenant.products.reduce(
        (sum, product) =>
          sum +
          Number(product.unit_price) * product.quantity_on_hand,
        0
      )

      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        created_at: tenant.created_at,
        product_count: tenant.products.length,
        user_count: tenant.users.length,
        total_value: totalValue,
      }
    })

    return NextResponse.json({
      tenants: formattedTenants,
    })
  } catch (error) {
    console.error('Admin tenants API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch tenants',
      },
      {
        status: 500,
      }
    )
  }
}