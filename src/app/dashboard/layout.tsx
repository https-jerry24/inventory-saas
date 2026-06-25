// src/app/dashboard/layout.tsx 
// This sidebar wraps ALL pages inside /dashboard/ 
  
import { createClient } from '@/lib/supabase/server' 
import { redirect }     from 'next/navigation' 
  
// Update the navLinks array to include ALL pages: 
const navLinks = [ 
  { href: '/dashboard',                  label: 'Dashboard'          }, 
  { href: '/dashboard/products',          label: 'Products'           }, 
  { href: '/dashboard/analytics',         label: 'Analytics'          }, 
  { href: '/dashboard/analytics/movement',label: 'Stock Movement'     }, 
  { href: '/dashboard/orders',            label: 'Purchase Orders'    }, 
  { href: '/dashboard/suppliers',         label: 'Suppliers'          }, 
  { href: '/dashboard/alerts',            label: 'Stock Alerts'       }, 
  { href: '/dashboard/ai',                label: 'AI Assistant'       }, 
  { href: '/dashboard/import',            label: 'Import CSV'         }, 
  { href: '/dashboard/audit',             label: 'Audit Log' },
] 
  
export default async function DashboardLayout({ children }: { children: 
React.ReactNode }) { 
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser() 
  if (!user) redirect('/login') 
  
  const tenantName = user.user_metadata?.companyName || 'My Company' 
  const userName   = user.user_metadata?.name || user.email 
  
  return ( 
    <div className="flex h-screen bg-slate-100"> 
  
      {/* Sidebar */} 
      <div className="w-64 bg-slate-900 flex flex-col flex-shrink-0"> 
        {/* Logo */} 
        <div className="px-6 py-5 border-b border-slate-700"> 
          <p className="text-white font-bold text-lg">StockFlow</p> 
          <p className="text-slate-400 text-xs mt-0.5">{tenantName}</p> 
        </div> 
  
        {/* Nav Links */} 
        <nav className="flex-1 px-3 py-4 space-y-1"> 
          {navLinks.map(link => ( 
            <a
  key={link.href}
  href={link.href}
  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm"
>
  {link.label}
</a>
          ))} 
        </nav> 
  
        {/* User info at bottom */} 
        <div className="px-4 py-4 border-t border-slate-700"> 
          <p className="text-slate-400 text-xs">{userName}</p> 
          <a href="/api/auth/signout" className="text-slate-500 hover:text
white text-xs mt-1 block"> 
            Sign out 
          </a> 
        </div> 
      </div> 
  
      {/* Main Content */} 
      <div className="flex-1 overflow-y-auto"> 
        {children} 
      </div> 
    </div> 
  ) 
} 