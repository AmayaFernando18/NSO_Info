export type QuickAccessLinkType = 'external' | 'internal' | 'section'

export type QuickAccessLinkMeta = {
  type: QuickAccessLinkType
  href: string
}

const EXTERNAL_PROTOCOL_PATTERN = /^(https?:\/\/|mailto:|tel:)/i

const toExternalHref = (value: string): string => {
  if (/^www\./i.test(value)) return `https://${value}`
  if (EXTERNAL_PROTOCOL_PATTERN.test(value)) return value
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`
  return value
}

export const getQuickAccessLinkMeta = (rawUrl: string): QuickAccessLinkMeta => {
  const value = String(rawUrl || '').trim()

  if (!value) {
    return { type: 'external', href: '#' }
  }

  if (value.startsWith('#')) {
    return { type: 'section', href: value }
  }

  if (value.startsWith('/')) {
    return { type: 'internal', href: value }
  }

  return { type: 'external', href: toExternalHref(value) }
}
