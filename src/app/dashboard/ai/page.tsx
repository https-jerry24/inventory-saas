'use client'

import { useState } from 'react'

const QUICK_QUESTIONS = [
  'Which products should I reorder this week?',
  'Which products have the highest stock risk?',
  'What is my most valuable inventory?',
  'Which products are moving fastest?',
  'Suggest purchase order quantities for low-stock items',
]

export default function AIAssistantPage() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [analysed, setAnalysed] = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [history,  setHistory]  = useState<{ q: string; a: string }[]>([])

  async function handleAsk(q?: string) {
    const finalQ = q || question
    if (!finalQ && !loading) { setQuestion('') }
    setLoading(true)
    setResponse('')

    const res = await fetch('/api/ai/suggest', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question: finalQ }),
    })

    let data
    try   { data = await res.json() }
    catch { data = { error: 'Invalid server response' } }

    setLoading(false)

    if (res.ok) {
      setResponse(data.suggestion)
      setAnalysed(data.productsAnalysed)
      setHistory(prev => [
        { q: finalQ || 'General analysis', a: data.suggestion },
        ...prev.slice(0, 4),
      ])
    } else {
      setResponse('Error: ' + data.error)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">
          AI Inventory Assistant
        </h1>
        <p className="text-slate-500 text-sm">
          Powered by Claude — analyses your live inventory data in real time
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Ask anything about your inventory
        </label>

        <div className="flex gap-2 mb-3">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="e.g. Which products should I reorder this week?"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Thinking…
              </>
            ) : 'Ask AI'}
          </button>
        </div>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleAsk(q)}
              disabled={loading}
              className="text-xs bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-emerald-700 font-medium text-sm">
              Claude is analysing your inventory data…
            </p>
          </div>
        </div>
      )}

      {/* AI Response */}
      {response && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-700 font-bold text-xs">AI</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  Claude&apos;s Recommendation
                </p>
                <p className="text-xs text-slate-400">
                  {analysed} products analysed
                </p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
              claude-sonnet-4-6
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
              {response}
            </pre>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 text-sm mb-4">
            Previous Questions
          </h2>
          <div className="space-y-3">
            {history.slice(1).map((h, i) => (
              <div
                key={i}
                className="border-l-2 border-emerald-200 pl-4 py-0.5"
              >
                <p className="text-sm font-medium text-slate-700 mb-1">{h.q}</p>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {h.a.slice(0, 150)}…
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}