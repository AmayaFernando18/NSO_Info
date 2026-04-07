import { useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { GalleryAlbumDto } from '../types'
import { fetchPublicGalleryAlbums } from '../services/galleryService'
import { resolveMediaUrl } from '../utils/media'

export default function GalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbumDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchPublicGalleryAlbums()
        if (mounted) {
          setAlbums(data)
          setError('')
        }
      } catch {
        if (mounted) {
          setError('Unable to load gallery albums right now.')
          setAlbums([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const orderedAlbums = useMemo(
    () => [...albums].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [albums]
  )

  return (
    <div className="min-h-screen bg-base">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_55%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">
            <ImageIcon className="h-4 w-4" />
            Gallery
          </div>
          <h1 className="mt-5 text-3xl md:text-4xl font-extrabold">Albums</h1>
          <p className="mt-3 max-w-2xl text-white/85 text-base md:text-lg">
            Explore our curated album collection. Click any album card to open and view all images.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : orderedAlbums.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-gray-500">
            No albums available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orderedAlbums.map((album) => {
              const albumId = album.id || album._id
              if (!albumId) return null

              return (
                <Link
                  key={albumId}
                  to={`/gallery/${albumId}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-vibrant"
                >
                  <div className="relative aspect-[16/10] bg-muted">
                    {album.coverImageUrl ? (
                      <img
                        src={resolveMediaUrl(album.coverImageUrl)}
                        alt={album.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-secondary/60">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary">
                      {album.imageCount || 0} image{(album.imageCount || 0) === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-bold text-secondary leading-tight">{album.name}</h2>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {album.description?.trim() || 'Open this album to view all photos.'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
