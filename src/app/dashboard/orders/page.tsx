'use client'

import { useEffect, useState } from 'react'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
}

type Product = {
  id: string
  name: string
  sku: string
}

type PurchaseOrderItem = {
  id: string
  quantity: number
  unit_cost: number
  products: Product | null
}

type Supplier = {
  id: string
  name: string
}

type PurchaseOrder = {
  id: string
  status: string
  created_at: string
  expected_at: string | null
  suppliers: Supplier | null
  purchase_order_items: PurchaseOrderItem[]
}

type OrdersResponse = {
  orders: PurchaseOrder[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then((response) => response.json())
      .then((data: OrdersResponse) => {
        setOrders(data.orders ?? [])
      })
      .catch((error) => {
        console.error('Failed to load orders:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Purchase Orders
          </h1>

          <p className="text-slate-400 mt-1">
            {orders.length} orders total
          </p>
        </div>

        <a
          href="/dashboard/orders/new"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700"
        >
          + New Order
        </a>
      </div>

      {loading ? (
        <p className="text-slate-400 animate-pulse">
          Loading orders...
        </p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-400">
          <p className="text-lg font-medium mb-2">
            No purchase orders yet
          </p>

          <a
            href="/dashboard/orders/new"
            className="text-teal-600"
          >
            Create your first order
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const total =
              order.purchase_order_items?.reduce(
                (sum, item) =>
                  sum +
                  Number(item.unit_cost) * item.quantity,
                0
              ) ?? 0

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.suppliers?.name ?? 'Unknown Supplier'} —{' '}
                      {order.purchase_order_items?.length ?? 0} item(s)
                    </p>

                    <p className="text-slate-400 text-sm mt-0.5">
                      Created{' '}
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}

                      {order.expected_at &&
                        ` · Expected ${new Date(
                          order.expected_at
                        ).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        STATUS_COLORS[order.status] ??
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>

                    <a
                      href={`/dashboard/orders/${order.id}`}
                      className="text-teal-600 text-sm font-medium hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-3">
                  {order.purchase_order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-slate-600">
                        {item.products?.name ?? 'Unknown Product'}
                      </span>

                      <span className="text-slate-500">
                        {item.quantity} × Rs.{' '}
                        {Number(
                          item.unit_cost
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-100 mt-1">
                    <span>Order Total</span>

                    <span>
                      Rs. {Math.round(total).toLocaleString()}
                    </span>
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