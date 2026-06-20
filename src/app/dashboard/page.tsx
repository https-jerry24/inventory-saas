// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
 
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
 
  const tenantId = user.user_metadata?.tenant_id
  const name     = user.user_metadata?.name
 
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-500 mb-8">Welcome back, {name}!</p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="font-bold text-blue-900 mb-2">Week 1 Complete!</h2>
          <p className="text-blue-800 text-sm">
            You are logged in. Your tenant_id: {tenantId}
          </p>
        </div>
      </div>
    </div>
  )
}