'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'

type ParsedRow = {
  name: string
  sku: string
  price: string
  qty: string
  reorder: string
}

type ImportResult = {
  imported: number
  skipped: number
  errors: string[]
}

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')


  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    setFileName(file.name)
    setResult(null)
    setError('')

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,

      transformHeader: (header: string) =>
        header.trim().toLowerCase().replace(/\s+/g, '_'),

      complete: (results) => {
        setRows(results.data)
      },

      error: (err) => {
        setError('Failed to parse CSV: ' + err.message)
      },
    })
  }


  async function handleImport() {
    if (rows.length === 0) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows }),
      })


      const data = await res.json()

      setLoading(false)


      if (!res.ok) {
        setError(data.error || 'Import failed')
        return
      }


      setResult(data)

    } catch {
      setLoading(false)
      setError('Something went wrong')
    }
  }


  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Import Products from CSV
      </h1>

      <p className="text-slate-500 mb-6">
        Upload a spreadsheet to bulk-import products
      </p>


      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">

        <h3 className="font-semibold text-blue-900 mb-2">
          CSV Format Required
        </h3>

        <p className="text-blue-800 text-sm mb-3">
          Your CSV file must have these headers:
        </p>

        <code className="bg-white px-3 py-2 rounded border block text-sm">
          name, sku, price, qty, reorder
        </code>

      </div>


      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:bg-blue-50 mb-6"
      >

        <div className="text-4xl mb-3">
          CSV
        </div>

        <p className="font-medium">
          {fileName || 'Click to choose CSV file'}
        </p>


        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
        />

      </div>



      {rows.length > 0 && (

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">

          <div className="px-4 py-3 border-b flex justify-between">

            <h3 className="font-semibold">
              Preview ({rows.length} rows)
            </h3>


            <button
              onClick={handleImport}
              disabled={loading}
              className="bg-green-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import Products'}
            </button>

          </div>


          <table className="w-full text-sm">

            <thead className="bg-slate-50">

              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Qty</th>
                <th className="px-4 py-2 text-left">Reorder</th>
              </tr>

            </thead>


            <tbody>

              {rows.slice(0,10).map((row,index)=>(

                <tr key={index} className="border-t">

                  <td className="px-4 py-2">{row.name}</td>

                  <td className="px-4 py-2">
                    {row.sku}
                  </td>

                  <td className="px-4 py-2">
                    {row.price}
                  </td>

                  <td className="px-4 py-2">
                    {row.qty}
                  </td>

                  <td className="px-4 py-2">
                    {row.reorder || 10}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}



      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}



      {result && (

        <div className="bg-green-50 text-green-700 p-4 rounded-lg">

          <h3 className="font-bold">
            Import Complete
          </h3>

          <p>
            {result.imported} products imported successfully.
          </p>

          {result.skipped > 0 && (
            <p>
              {result.skipped} rows skipped.
            </p>
          )}

        </div>

      )}

    </div>
  )
}