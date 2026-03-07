const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || ''

const getApiOrigin = () => {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    return ''
  }
}

export function resolveMediaUrl(path: string): string {
  if (!path) return ''

  const normalizedPath = path.replace(/\\/g, '/').trim()

  // Keep existing absolute URLs for backward compatibility with legacy data.
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    return normalizedPath
  }

  const origin = getApiOrigin()

  // If API origin is unavailable, fallback to root-relative path for local hosting.
  if (!origin) {
    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  }

  // Canonical format is `/uploads/...`; still normalize any relative input safely.
  return normalizedPath.startsWith('/') ? `${origin}${normalizedPath}` : `${origin}/${normalizedPath}`
}

// Backward-compatible alias used by existing imports.
export const resolveAssetUrl = resolveMediaUrl
