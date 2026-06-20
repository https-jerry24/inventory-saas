import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
 
export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return supabaseResponse
}
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}