// src/app/api/auth/signout/route.ts 
import { createClient }  from '@/lib/supabase/server' 
import { NextResponse }  from 'next/server' 
  
export async function GET() { 
  const supabase = await createClient() 
  await supabase.auth.signOut() 
  return NextResponse.redirect(new URL('/login', 
process.env.NEXT_PUBLIC_SUPABASE_URL!)) 
} 