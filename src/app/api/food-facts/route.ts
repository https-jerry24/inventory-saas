// Searches Open Food Facts by barcode OR product name

import { NextResponse } from 'next/server'

// Shape of the product data we extract from Open Food Facts
type FoodProduct = {
  barcode: string
  name: string
  brand: string
  imageUrl: string
  category: string
}

type OpenFoodFactsProduct = {
  code?: string
  product_name?: string
  product_name_en?: string
  brands?: string
  image_url?: string
  image_front_url?: string
  categories?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const barcode = searchParams.get('barcode')
  const query = searchParams.get('query')

  if (!barcode && !query) {
    return NextResponse.json(
      { error: 'Provide ?barcode=... or ?query=...' },
      { status: 400 }
    )
  }

  try {
    let products: FoodProduct[] = []

    if (barcode) {
      // Search by exact barcode

      const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'InventorySaaS/1.0',
        },
      })

      const data = await res.json()

      if (data.status === 1 && data.product) {
        const p = data.product as OpenFoodFactsProduct

        products = [
          {
            barcode,
            name:
              p.product_name ||
              p.product_name_en ||
              'Unknown Product',
            brand: p.brands || '',
            imageUrl:
              p.image_url ||
              p.image_front_url ||
              '',
            category:
              p.categories?.split(',')[0]?.trim() ||
              'Food & Beverages',
          },
        ]
      }
    } else {
      // Search by product name

      const encoded = encodeURIComponent(query!)

      const url =
        `https://world.openfoodfacts.org/cgi/search.pl` +
        `?search_terms=${encoded}` +
        `&json=1` +
        `&page_size=8` +
        `&fields=code,product_name,brands,image_url,categories`

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'InventorySaaS/1.0',
        },
      })

      const data = await res.json()

      products = ((data.products || []) as OpenFoodFactsProduct[])
        .map((p) => ({
          barcode: p.code || '',
          name: p.product_name || 'Unknown',
          brand: p.brands || '',
          imageUrl: p.image_url || '',
          category:
            p.categories?.split(',')[0]?.trim() ||
            'Food & Beverages',
        }))
        .filter((p) => p.name !== 'Unknown')
    }

    return NextResponse.json({ products })
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach Open Food Facts' },
      { status: 500 }
    )
  }
}