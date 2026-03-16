import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Newspaper, ShieldCheck, Image, ArrowLeft, LogOut, Calendar } from 'lucide-react'
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
    { to: '/admin/events', label: 'Events Management', icon: Calendar, requirePermission: RBAC_FUNCTION.EVENTS },
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
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden flex">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-secondary/10 rounded-full blur-3xl opacity-60 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] h-screen flex-shrink-0 border-r border-border bg-white/90 backdrop-blur-xl shadow-xl p-5 relative z-20">
        {/* Logo Header with Gradient */}
        <Link to="/" className="flex items-center gap-3 mb-6 pb-5 border-b border-border group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">NSO Info</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>

        {/* Navigation with Enhanced Hover Effects */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-[1.02]'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary hover:scale-[1.02]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Animated Background Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                    )}
                    <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                    <span>{item.label}</span>
                    {!isActive && (
                      <ArrowLeft className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all rotate-180" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Actions with Enhanced Styling */}
        <div className="mt-auto pt-4 border-t border-border space-y-2">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-300 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portal</span>
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 group"
          >
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header - only visible on smaller screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-b border-border p-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-accent p-1.5 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-primary">NSO Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <NavLink to="/" className="p-2 text-gray-600 hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <button onClick={logout} className="p-2 text-red-600 hover:text-red-700">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        <nav className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Scrollable Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10">
        <div className="p-4 md:p-6 lg:p-8 lg:pt-6 pt-32 min-h-full">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-border bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="p-4 md:p-6 lg:p-8">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
