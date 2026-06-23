// src/app/api/categories/route.ts 
import { NextResponse } from 'next/server' 
import { createClient }  from '@/lib/supabase/server' 
  
export async function GET() { 
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser() 
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 
}) 
  
  // RLS automatically filters by tenant 
  const { data: categories } = await supabase 
    .from('categories').select('id, name').order('name') 
  
  return NextResponse.json({ categories }) 
} 
  
export async function POST(request: Request) { 
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser() 
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 
}) 
  
  const { name } = await request.json() 
  const tenantId = user.user_metadata?.tenant_id 
  
  const { data, error } = await supabase 
    .from('categories').insert({ tenant_id: tenantId, name 
}).select().single() 
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 
}) 
  return NextResponse.json({ category: data }, { status: 201 }) 
} 