'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'

type ParsedRow   = { name: string; sku: string; price: string; qty: string; reorder: string }
type ImportResult = { imported: number; skipped: number; errors: string[] }

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [rows,     setRows]     = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<ImportResult | null>(null)
  const [error,    setError]    = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name); setResult(null); setError('')
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: results => setRows(results.data),
      error:    err     => setError('Failed to parse CSV: ' + err.message),
    })
  }

  async function handleImport() {
    if (rows.length === 0) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res  = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) { setError(data.error || 'Import failed'); return }
      setResult(data)
    } catch { setLoading(false); setError('Something went wrong') }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">
        Import Products from CSV
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Upload a spreadsheet to bulk-import products into your inventory
      </p>

      {/* Format Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
        <h3 className="font-semibold text-emerald-900 text-sm mb-1">CSV Format Required</h3>
        <p className="text-emerald-800 text-xs mb-3">
          Your CSV file must have these column headers (exactly):
        </p>
        <code className="bg-white border border-emerald-100 text-emerald-800 px-3 py-2 rounded-lg block text-sm font-mono">
          name, sku, price, qty, reorder
        </code>
        <p className="text-emerald-700 text-xs mt-2">
          First row = headers. Each following row = one product. Save Excel file as .csv before uploading.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50 rounded-xl p-12 text-center cursor-pointer transition mb-5"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-emerald-700 font-bold text-sm">CSV</span>
        </div>
        <p className="font-semibold text-slate-900 mb-1">
          {fileName || 'Click to choose CSV file'}
        </p>
        <p className="text-slate-400 text-xs">
          {fileName ? `${rows.length} rows found` : 'Supports .csv files only'}
        </p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </div>

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Preview</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {rows.length} rows detected · showing first 10
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing…' : `Import ${rows.length} Products`}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Name','SKU','Price','Qty','Reorder'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{row.sku}</td>
                  <td className="px-4 py-2.5 text-slate-600">Rs. {row.price}</td>
                  <td className="px-4 py-2.5 text-slate-600">{row.qty}</td>
                  <td className="px-4 py-2.5 text-slate-600">{row.reorder || 10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-4 rounded-xl">
          <p className="font-semibold mb-1">Import Complete</p>
          <p className="text-sm">{result.imported} products imported successfully.</p>
          {result.skipped > 0 && (
            <p className="text-sm text-emerald-600">{result.skipped} rows skipped.</p>
          )}
        </div>
      )}
    </div>
  )
}