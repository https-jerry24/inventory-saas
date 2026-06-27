'use client'

import { useEffect, useState } from 'react'
import ProductForm from '@/components/ProductForm'

type ProductData = {
  name:           string
  sku:            string
  barcode:        string
  unitPrice:      number
  quantityOnHand: number
  reorderLevel:   number
  categoryId:     string
  supplierId:     string
  imageUrl:       string
}

export default function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const [initialData, setInitialData] = useState<ProductData | null>(null)

  useEffect(() => {
    async function loadProduct() {
      const res  = await fetch(`/api/products/${id}`)
      const data = await res.json()
      const p    = data.product

      setInitialData({
        name:           p.name,
        sku:            p.sku,
        barcode:        p.barcode          || '',
        unitPrice:      p.unit_price,
        quantityOnHand: p.quantity_on_hand,
        reorderLevel:   p.reorder_point    || 10,
        categoryId:     p.category_id      || '',
        supplierId:     p.supplier_id      || '',
        imageUrl:       p.image_url        || '',
      })
    }
    loadProduct()
  }, [id])

  if (!initialData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading product…</span>
        </div>
      </div>
    )
  }

  return <ProductForm productId={id} initialData={initialData} />
}