// src/app/dashboard/ai/page.tsx 
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
  const [question,  setQuestion]  = useState('') 
  const [response,  setResponse]  = useState('') 
  const [analysed,  setAnalysed]  = useState(0) 
  const [loading,   setLoading]   = useState(false) 
  const [history,   setHistory]   = useState<{q:string;a:string}[]>([]) 
  
  async function handleAsk(q?: string) { 
    const finalQ = q || question 
    if (!finalQ && !loading) {setQuestion('') }
    setLoading(true) 
    setResponse('') 
  
    const res  = await fetch('/api/ai/suggest', { 
      method:  'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body:    JSON.stringify({ question: finalQ }), 
    }) 
    let data

try {
  data = await res.json()
} catch {
  data = { error: 'Invalid server response' }
}

setLoading(false)

if (res.ok) { 

      setResponse(data.suggestion) 
      setAnalysed(data.productsAnalysed) 
      setHistory(prev => [{ q: finalQ || 'General analysis', a: 
data.suggestion }, ...prev.slice(0,4)]) 
    } else { 
      setResponse('Error: ' + data.error) 
    } 
  } 
  
  return ( 
    <div className="p-6 max-w-4xl mx-auto"> 
      {/* Header */} 
      <div className="mb-8"> 
        <h1 className="text-3xl font-bold text-slate-900 mb-1">AI Inventory 
Assistant</h1> 
        <p className="text-slate-400">Powered by Claude — analyses your live 
inventory data</p> 
      </div> 
  
      {/* Main input */} 
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6"> 
        <label className="block text-sm font-medium text-slate-700 mb-2"> 
          Ask anything about your inventory 
        </label> 
        <div className="flex gap-3"> 
          <input 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAsk()} 
            placeholder="e.g. Which products should I reorder this week?" 
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 
text-sm" 
          /> 
          <button onClick={() => handleAsk()} disabled={loading} 
            className="bg-pink-600 text-white px-6 py-3 rounded-xl font-medium 
hover:bg-pink-700 disabled:opacity-50"> 
            {loading ? 'Thinking...' : 'Ask AI'} 
          </button> 
        </div> 
  
        {/* Quick question buttons */} 
        <div className="flex flex-wrap gap-2 mt-3"> 
          {QUICK_QUESTIONS.map((q,i) => ( 
            <button key={i} onClick={() => handleAsk(q)} disabled={loading} 
              className="text-xs bg-slate-100 text-slate-600 px-3 py-1 
rounded-full hover:bg-pink-100 hover:text-pink-700 transition-colors"> 
              {q} 
            </button> 
          ))} 
        </div> 
      </div> 
  
      {/* AI Response */} 
      {loading && ( 
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 mb
6"> 
          <div className="flex items-center gap-3"> 
            <div className="w-6 h-6 border-2 border-pink-400 border-t
transparent rounded-full animate-spin" /> 
            <p className="text-pink-700 font-medium">Claude is analysing your 
inventory data...</p> 
          </div> 
        </div> 
      )} 
  
      {response && !loading && ( 
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6"> 
          <div className="flex items-center justify-between mb-4"> 
            <div className="flex items-center gap-2"> 
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items
center justify-center text-pink-700 font-bold text-sm">AI</div> 
              <p className="font-semibold text-slate-900">Claude&apos;s 
Recommendation</p> 
            </div> 
            <p className="text-xs text-slate-400">{analysed} products 
analysed</p> 
          </div> 
          <div className="bg-slate-50 rounded-xl p-4"> 
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font
sans leading-relaxed">{response}</pre> 
          </div> 
        </div> 
      )} 
  
      {/* History */} 
      {history.length > 1 && ( 
        <div className="bg-white rounded-2xl shadow-sm p-6"> 
          <h2 className="font-semibold text-slate-900 mb-4">Previous 
Questions</h2> 
          <div className="space-y-4"> 
            {history.slice(1).map((h,i) => ( 
              <div key={i} className="border-l-4 border-pink-200 pl-4"> 
                <p className="text-sm font-medium text-slate-700 mb
1">{h.q}</p> 
                <p className="text-xs text-slate-400 line-clamp
2">{h.a.slice(0,150)}...</p> 
              </div> 
            ))} 
          </div> 
        </div> 
      )} 
    </div> 
  ) 
} 