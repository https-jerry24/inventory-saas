import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/admin', label: 'Super Admin Panel' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/analytics/movement', label: 'Stock Movement' },
  { href: '/dashboard/orders', label: 'Purchase Orders' },
  { href: '/dashboard/suppliers', label: 'Suppliers' },
  { href: '/dashboard/alerts', label: 'Stock Alerts' },
  { href: '/dashboard/ai', label: 'AI Assistant' },
  { href: '/dashboard/import', label: 'Import CSV' },
  { href: '/dashboard/audit', label: 'Audit Log' },
  { href: '/dashboard/db-info', label: 'DB Concepts Proof' },
]

const topLinks = navLinks.slice(0, 7)
const toolLinks = navLinks.slice(7)

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const tenantName = user.user_metadata?.companyName || 'My Company'
  const userName = user.user_metadata?.name || user.email || 'User'
  const initials = userName.slice(0, 1).toUpperCase()

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className="w-56 flex flex-col flex-shrink-0"
        style={{ background: '#0B1A12' }}
      >
        {/* Logo */}
        <div
          className="px-4 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">SF</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              StockFlow
            </span>
          </div>

          <p className="text-slate-600 text-xs ml-9 truncate">{tenantName}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {topLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border-l-2 border-transparent hover:border-emerald-500"
            >
              {link.label}
            </a>
          ))}

          <p
            className="px-3 pt-3 pb-1 text-xs font-semibold tracking-widest"
            style={{ color: 'rgba(255,255,255,0.12)' }}
          >
            TOOLS
          </p>

          {toolLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border-l-2 border-transparent hover:border-emerald-500"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* User */}
        <div
          className="px-3 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{
                background: 'rgba(16,185,129,0.15)',
                color: '#34D399',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              {initials}
            </div>

            <div className="min-w-0">
              <p className="text-slate-300 text-xs font-medium truncate">
                {userName}
              </p>
              <p className="text-slate-600 text-xs">Tenant Admin</p>
            </div>
          </div>

          <a
            href="/api/auth/signout"
            className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
          >
            Sign out →
          </a>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </div>
    </div>
  )
}