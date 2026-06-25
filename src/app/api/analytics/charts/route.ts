import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ProductRow = {
  name: string
  sku: string
  unit_price: number | string
  quantity_on_hand: number
  reorder_point: number
  categories:
    | {
        name: string
      }[]
    | null
}

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
  .from('products')
  .select(`
    name,
    sku,
    unit_price,
    quantity_on_hand,
    reorder_point,
    categories(name)
  `)

console.log(JSON.stringify(data?.[0], null, 2))
    

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      { error: 'No data found' },
      { status: 500 }
    )
  }

  const products = data as unknown as ProductRow[]

  // Top 8 products by inventory value
  const topByValue = [...products]
    .map((p) => ({
      name:
        p.name.length > 20
          ? p.name.slice(0, 20) + '...'
          : p.name,
      value:
        Math.round(
          Number(p.unit_price) * p.quantity_on_hand
        ),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Category breakdown
  const categoryMap: Record<string, number> = {}

  products.forEach((p) => {
    const categoryName =
  p.categories?.[0]?.name || 'Uncategorised'

    categoryMap[categoryName] =
      (categoryMap[categoryName] || 0) + 1
  })

  const byCategory = Object.entries(categoryMap)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  // Low stock products
  const lowStock = products
    .filter(
      (p) =>
        p.quantity_on_hand <= p.reorder_point
    )
    .map((p) => ({
      name: p.name,
      qty: p.quantity_on_hand,
      reorder: p.reorder_point,
    }))
    .slice(0, 10)

  // Summary stats
  const totalValue = products.reduce(
    (sum, p) =>
      sum +
      Number(p.unit_price) *
        p.quantity_on_hand,
    0
  )

  const totalProducts = products.length

  const lowStockCount = products.filter(
    (p) =>
      p.quantity_on_hand <= p.reorder_point
  ).length

  const outOfStock = products.filter(
    (p) => p.quantity_on_hand === 0
  ).length

  return NextResponse.json({
    topByValue,
    byCategory,
    lowStock,
    stats: {
      totalValue,
      totalProducts,
      lowStockCount,
      outOfStock,
    },
  })
}