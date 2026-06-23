// src/app/dashboard/products/[id]/edit/page.tsx

'use client'

import { useEffect, useState } from 'react'
import ProductForm from '@/components/ProductForm'

type ProductData = {
  name: string
  sku: string
  barcode: string
  unitPrice: number
  quantityOnHand: number
  reorderLevel: number
  categoryId: string
  supplierId: string
  imageUrl: string
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
      const res = await fetch(`/api/products/${id}`)
      const data = await res.json()

      const p = data.product

      setInitialData({
        name: p.name,
        sku: p.sku,
        barcode: p.barcode || '',
        unitPrice: p.unit_price,
        quantityOnHand: p.quantity_on_hand,
        reorderLevel: p.reorder_point || 10,
        categoryId: p.category_id || '',
        supplierId: p.supplier_id || '',
        imageUrl: p.image_url || '',
      })
    }

    loadProduct()
  }, [id])

  if (!initialData) {
    return <div className="p-6 text-slate-400">Loading...</div>
  }

  return (
    <ProductForm
      productId={id}
      initialData={initialData}
    />
  )
}