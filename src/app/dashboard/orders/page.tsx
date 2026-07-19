'use client'

import { useEffect, useState } from 'react'

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100  text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
}

type Product          = { id: string; name: string; sku: string }
type PurchaseOrderItem = { id: string; quantity: number; unit_cost: number; products: Product | null }
type Supplier = {
  name: string
  email?: string | null
}
type PurchaseOrder    = {
  id: string; status: string; created_at: string; expected_at: string | null
  suppliers: Supplier | null; purchase_order_items: PurchaseOrderItem[]
}
type OrdersResponse   = { orders: PurchaseOrder[] }

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then((data: OrdersResponse) => setOrders(data.orders ?? []))
      .catch(err => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Purchase Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} orders total</p>
        </div>
                <a
          href="/dashboard/orders/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + New Order
        </a>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading orders…</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-14 text-center">
          <p className="text-slate-500 font-medium mb-1">No purchase orders yet</p>
          <a href="/dashboard/orders/new" className="text-emerald-600 text-sm hover:underline">
            Create your first order
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const total = order.purchase_order_items?.reduce(
              (sum, item) => sum + Number(item.unit_cost) * item.quantity, 0
            ) ?? 0

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.suppliers?.name ?? 'Unknown Supplier'}
                      <span className="text-slate-400 font-normal ml-2">
                        · {order.purchase_order_items?.length ?? 0} item(s)
                      </span>
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5 font-mono">
                      #{order.id.slice(0, 8)}
                      {' · '}Created {new Date(order.created_at).toLocaleDateString()}
                      {order.expected_at && ` · Expected ${new Date(order.expected_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <a
                      href={`/dashboard/orders/${order.id}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-3">
                  {order.purchase_order_items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.products?.name ?? 'Unknown Product'}</span>
                      <span className="text-slate-500 font-mono text-xs">
                        {item.quantity} × Rs. {Number(item.unit_cost).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-100 mt-1">
                    <span className="text-slate-700">Order Total</span>
                    <span className="text-slate-900">Rs. {Math.round(total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}