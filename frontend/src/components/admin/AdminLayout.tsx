import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Newspaper, ShieldCheck, Image, ArrowLeft, LogOut } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { hasAuthority } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'

export default function AdminLayout() {
  const { user, logout } = useUser()

  // Define all possible links with their permission requirements
  const allLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, requirePermission: null },
    { to: '/admin/news', label: 'News Management', icon: Newspaper, requirePermission: RBAC_FUNCTION.NEWS },
    { to: '/admin/hero', label: 'Hero Management', icon: Image, requirePermission: RBAC_FUNCTION.HERO },
    { to: '/admin/users', label: 'RBAC Users', icon: ShieldCheck, requirePermission: 'superAdminOnly' as const },
  ]

  // Filter links based on user permissions
  const links = allLinks.filter((link) => {
    if (!link.requirePermission) return true // Always show Overview
    if (link.requirePermission === 'superAdminOnly') return user?.isSuperAdmin
    // For other links, check if user has at least 'E' (Enter) authority for that function
    return hasAuthority(user, link.requirePermission, 'E')
  })

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(242,75,58,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,197,61,0.10),transparent_30%)] bg-surface">
      <div className="mx-auto max-w-400 p-3 md:p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
          <aside className="h-screen rounded-2xl border border-border bg-elevated shadow-[0_20px_48px_-24px_rgba(15,10,10,0.35)] p-4 md:p-5 lg:sticky lg:top-6 lg:self-start flex flex-col">
            <Link to="/" className="flex items-center gap-2.5 mb-6 pb-4 border-b border-border group">
              <div className="bg-elevated border border-border p-1.5 rounded-lg shadow-[0_8px_20px_rgba(242,75,58,0.2)] group-hover:shadow-[0_10px_28px_rgba(242,75,58,0.28)] transition-shadow">
                <img src="/logo.png" alt="NSO logo" className="h-8 w-8 rounded-md object-cover" />
              </div>
              <div>
                <h1 className="text-base font-bold text-secondary leading-tight">NSO Info</h1>
                <p className="text-[10px] text-content-muted leading-tight">Admin Panel</p>
              </div>
            </Link>

            <nav className="space-y-1.5">
              {links.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-linear-to-r from-primary/20 to-accent/15 text-primary border border-primary/30'
                          : 'text-secondary border border-transparent hover:border-border hover:bg-surface-muted'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-border space-y-1.5">
              <NavLink
                to="/"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-secondary border border-transparent hover:border-border hover:bg-surface-muted transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Portal</span>
              </NavLink>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-critical-strong border border-transparent hover:border-critical-border hover:bg-critical-soft transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          <section className="rounded-2xl border border-border bg-elevated shadow-[0_20px_48px_-24px_rgba(15,10,10,0.35)] overflow-hidden">
            <div className="p-4 md:p-6 lg:p-7">
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
