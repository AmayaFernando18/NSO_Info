import { useUser } from '../../context/UserContext'
import { ShieldCheck, Newspaper, Image, Users, ArrowRight, Sparkles, Calendar, Download } from 'lucide-react'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import { Link } from 'react-router-dom'
import type { FunctionPermission } from '../../types'

const AUTHORITY_RANK: Record<string, number> = {
  C: 1,
  E: 2,
  A: 3,
  M: 4,
}

export default function AdminOverviewPage() {
  const { user } = useUser()
  const permissions = user && Array.isArray(user.functionPermissions) ? user.functionPermissions : []

  const uniquePermissions = permissions.reduce<FunctionPermission[]>((acc, perm) => {
    const existingIndex = acc.findIndex((p) => p.function === perm.function)
    if (existingIndex === -1) {
      acc.push(perm)
      return acc
    }

    const existingRank = AUTHORITY_RANK[acc[existingIndex].authority] || 0
    const incomingRank = AUTHORITY_RANK[perm.authority] || 0
    if (incomingRank > existingRank) {
      acc[existingIndex] = perm
    }

    return acc
  }, [])

  const cards = [
    {
      title: 'News Management',
      description: 'Create, edit, and publish news articles',
      icon: Newspaper,
      to: '/admin/news',
      gradient: 'from-sky-400 via-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/20',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      canAccess: canPerformAction(user, RBAC_FUNCTION.NEWS, 'view'),
    },
    {
      title: 'Hero Slides',
      description: 'Manage homepage hero carousel images',
      icon: Image,
      to: '/admin/hero',
      gradient: 'from-indigo-400 via-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/20',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      canAccess: canPerformAction(user, RBAC_FUNCTION.HERO, 'view'),
    },
    {
      title: 'Events Management',
      description: 'Manage events, holidays, and calendar',
      icon: Calendar,
      to: '/admin/events',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      shadowColor: 'shadow-teal-500/20',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      canAccess: canPerformAction(user, RBAC_FUNCTION.EVENTS, 'view'),
    },
    {
      title: 'Gallery Management',
      description: 'Manage albums and gallery images',
      icon: Image,
      to: '/admin/gallery',
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      shadowColor: 'shadow-orange-500/20',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      canAccess: canPerformAction(user, RBAC_FUNCTION.GALLERY, 'view'),
    },
    {
      title: 'Corporate Members',
      description: 'Manage corporate members and leadership categories',
      icon: Users,
      to: '/admin/corporate',
      gradient: 'from-cyan-400 via-sky-500 to-blue-600',
      shadowColor: 'shadow-cyan-500/20',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      canAccess: canPerformAction(user, RBAC_FUNCTION.CORPORATE, 'view'),
    },
    {
      title: 'Downloads',
      description: 'Manage downloadable PDFs by category, title, and language',
      icon: Download,
      to: '/admin/downloads',
      gradient: 'from-fuchsia-400 via-pink-500 to-rose-600',
      shadowColor: 'shadow-pink-500/20',
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      canAccess: canPerformAction(user, RBAC_FUNCTION.DOWNLOADS, 'view'),
    },
    {
      title: 'User Access Control',
      description: 'Manage RBAC permissions (SuperAdmin only)',
      icon: ShieldCheck,
      to: '/admin/users',
      gradient: 'from-rose-400 via-red-500 to-red-600',
      shadowColor: 'shadow-red-500/20',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      canAccess: user?.isSuperAdmin || false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary p-8 text-white shadow-vibrant">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-6 w-6 text-gold animate-pulse" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Welcome back, <span className="font-semibold text-white">{user?.name || user?.username}</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            System Active
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.filter(card => card.canAccess).map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.to}
              to={card.to}
              className="group relative bg-white rounded-2xl border border-border p-6 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-90 transition-opacity duration-500`}></div>
              
              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 ${card.shadowColor} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon Container */}
                <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <Icon className={`h-8 w-8 ${card.iconColor} group-hover:text-white transition-colors duration-500`} />
                </div>
                
                {/* Title & Description */}
                <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-white transition-colors duration-500">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 group-hover:text-blue-100 transition-colors duration-500">
                  {card.description}
                </p>
                
                {/* Arrow Icon */}
                <div className="flex items-center gap-2 text-accent group-hover:text-white transition-colors duration-500">
                  <span className="text-sm font-semibold">Manage</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-500" />
                </div>
              </div>
              
              {/* Decorative Corner Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          )
        })}
      </div>

      {/* Permissions Card with Enhanced Design */}
      <div className="relative bg-white rounded-2xl border border-border overflow-hidden shadow-soft">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent"></div>
        
        <div className="relative p-8">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-2">
                Your Permissions
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Access Level
                </span>
              </h3>
              
              {user?.isSuperAdmin ? (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg text-white">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-bold text-lg">SuperAdmin</span>
                  <span className="text-red-100 text-sm">• Full System Access</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uniquePermissions && uniquePermissions.length > 0 ? (
                    uniquePermissions.map((perm) => (
                      <div 
                        key={perm.function} 
                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20 hover:border-accent hover:shadow-lg transition-all duration-300"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                          {perm.authority}
                        </div>
                        <div>
                          <div className="font-bold text-secondary text-base">{perm.function}</div>
                          <div className="text-xs text-gray-600">
                            {perm.authority === 'E' ? 'Enter (View + Create)' : 
                             perm.authority === 'C' ? 'Check (View Only)' : 
                             perm.authority === 'A' ? 'Approve (View + Approve)' : 
                             'Manager (Full Access)'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No function permissions assigned</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>
      </div>
    </div>
  )
}
