'use client'

import {
  downloadPurchaseInvoice,
  printPurchaseInvoice,
  type InvoiceData,
} from '@/lib/invoicePDF'

type Props = {
  data: InvoiceData
  email?: string
}

export default function InvoiceActions({
  data,
  email,
}: Props) {
  async function sendInvoice() {
    if (!email) {
      alert('No email available.')
      return
    }

    const res = await fetch('/api/orders/send-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        invoice: data,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      alert(result.error)
      return
    }

    alert('Invoice sent successfully.')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => downloadPurchaseInvoice(data)}
        className="bg-emerald-600 text-white px-5 py-2 rounded-lg"
      >
        Download PDF
      </button>

      <button
        onClick={() => printPurchaseInvoice(data)}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        Print
      </button>

      {email && (
        <button
          onClick={sendInvoice}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg"
        >
          Email Invoice
        </button>
      )}
    </div>
  )
}