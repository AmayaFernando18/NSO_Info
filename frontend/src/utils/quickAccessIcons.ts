import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const EXCLUDED_EXPORTS = new Set([
  'createLucideIcon',
  'Icon',
  'icons',
  'LucideIcon',
])

const isForwardRefComponent = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>
  return '$$typeof' in candidate && typeof candidate.render === 'function'
}

const isUsableIconExport = (name: string, value: unknown): value is LucideIcon => {
  if (EXCLUDED_EXPORTS.has(name)) return false
  if (!/^[A-Z]/.test(name)) return false

  // lucide-react icons are typically React forwardRef components (objects),
  // while some tooling paths can expose callable components.
  return typeof value === 'function' || isForwardRefComponent(value)
}

const ICON_ENTRIES = Object.entries(LucideIcons).filter(([name, value]) => isUsableIconExport(name, value))

export const QUICK_ACCESS_ICON_NAMES = ICON_ENTRIES.map(([name]) => name).sort((a, b) => a.localeCompare(b))

const DEFAULT_RELATED_ICON_NAMES = [
  'Activity',
  'ArrowRightLeft',
  'BadgeCheck',
  'Bell',
  'BookOpen',
  'BriefcaseBusiness',
  'Building2',
  'Calculator',
  'CalendarDays',
  'ChartColumn',
  'CircleHelp',
  'ClipboardList',
  'ExternalLink',
  'FileText',
  'Files',
  'FolderOpen',
  'Globe',
  'HardHat',
  'HelpCircle',
  'Landmark',
  'Link2',
  'Mail',
  'MapPinned',
  'MonitorSmartphone',
  'Newspaper',
  'NotebookText',
  'Search',
  'Settings',
  'ShieldCheck',
  'Users',
  'Wrench',
  'Zap',
]

export const QUICK_ACCESS_RELATED_ICON_NAMES = DEFAULT_RELATED_ICON_NAMES.filter((name) =>
  QUICK_ACCESS_ICON_NAMES.includes(name)
)

export const getQuickAccessIconOptions = (searchTerm: string): string[] => {
  const search = searchTerm.trim().toLowerCase()
  if (!search) return QUICK_ACCESS_RELATED_ICON_NAMES

  return QUICK_ACCESS_ICON_NAMES.filter((name) => name.toLowerCase().includes(search))
}

export const resolveQuickAccessIcon = (iconName: string): LucideIcon | null => {
  const icon = (LucideIcons as Record<string, unknown>)[iconName]
  if (!isUsableIconExport(iconName, icon)) return null
  return icon
}
