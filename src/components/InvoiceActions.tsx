'use client'

import { useState } from 'react'

import {
  downloadPurchaseInvoice,
  printPurchaseInvoice,
  type InvoiceData,
} from '@/lib/invoicePDF'

interface Props {
  invoiceData: InvoiceData
}

export default function InvoiceActions({
  invoiceData,
}: Props) {
  const [printing, setPrinting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function handlePrint() {
    setPrinting(true)
    printPurchaseInvoice(invoiceData)
    setPrinting(false)
  }

  async function handleDownload() {
    setDownloading(true)
    downloadPurchaseInvoice(invoiceData)
    setDownloading(false)
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handlePrint}
        disabled={printing}
        className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm"
      >
        {printing ? 'Printing...' : 'Print'}
      </button>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
      >
        {downloading ? 'Generating...' : 'Save PDF'}
      </button>
    </div>
  )
}