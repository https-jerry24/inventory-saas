// src/hooks/useRealtimeProducts.ts

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type StockUpdate = {
  productId: string
  productName: string
  newQty: number
  changeQty: number
  timestamp: string
}

type InventoryLog = {
  product_id: string
  new_qty: number
  change_qty: number
  log_date: string
}

export function useRealtimeProducts(
  onProductChange?: (update: StockUpdate) => void
) {
  const [recentUpdates, setRecentUpdates] = useState<StockUpdate[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory_logs',
        },
        (payload) => {
          const log = payload.new as InventoryLog

          const update: StockUpdate = {
            productId: log.product_id,
            productName: 'Product',
            newQty: log.new_qty,
            changeQty: log.change_qty,
            timestamp: log.log_date,
          }

          setRecentUpdates((prev) => [
            update,
            ...prev,
          ].slice(0, 10))

          onProductChange?.(update)
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [onProductChange])

  return {
    recentUpdates,
    connected,
  }
}