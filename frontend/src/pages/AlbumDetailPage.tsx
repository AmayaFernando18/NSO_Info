import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { GalleryAlbumDetailDto } from '../types'
import { fetchPublicGalleryAlbumDetail } from '../services/galleryService'
import { resolveMediaUrl } from '../utils/media'

export default function AlbumDetailPage() {
  const { id = '' } = useParams()

  const [albumDetail, setAlbumDetail] = useState<GalleryAlbumDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Album not found.')
      setLoading(false)
      return
    }

    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchPublicGalleryAlbumDetail(id)
        if (mounted) {
          setAlbumDetail(data)
          setError('')
        }
      } catch {
        if (mounted) {
          setError('Unable to load this album right now.')
          setAlbumDetail(null)
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
  }, [id])

  const images = useMemo(
    () => [...(albumDetail?.images || [])].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [albumDetail?.images]
  )

  const goToSlide = (index: number) => {
    if (images.length === 0) return
    const nextIndex = (index + images.length) % images.length
    setCurrentSlide(nextIndex)
  }

  const nextSlide = () => {
    goToSlide(currentSlide + 1)
  }

  const prevSlide = () => {
    goToSlide(currentSlide - 1)
  }

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    if (images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length)
      }, 3000)
    }
  }

  useEffect(() => {
    setCurrentSlide(0)
  }, [id, images.length])

  useEffect(() => {
    resetAutoPlay()
    const handleResize = () => {
      setCurrentSlide((prev) => (images.length > 0 ? Math.min(prev, images.length - 1) : 0))
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [images.length])

  return (
    <div className="min-h-screen bg-base">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : albumDetail ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h1 className="text-2xl md:text-3xl font-extrabold text-secondary">{albumDetail.album.name}</h1>
              <p className="mt-2 text-gray-600 max-w-3xl">
                {albumDetail.album.description?.trim() || 'Album images'}
              </p>
            </div>

            {images.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-gray-500">
                This album does not contain images yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      prevSlide()
                      resetAutoPlay()
                    }}
                    className="md:p-2 p-1 bg-black/30 md:mr-6 mr-2 rounded-full hover:bg-black/50 text-white"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <div className="w-full max-w-4xl overflow-hidden relative rounded-3xl border border-border bg-white shadow-soft">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {images.map((image) => {
                        const imageId = image.id || image._id
                        const isActive = images[currentSlide]?.id === imageId || images[currentSlide]?._id === imageId
                        return (
                          <div key={imageId} className="w-full flex-shrink-0">
                            <div className="relative aspect-[16/9] bg-muted">
                              {image.imageUrl ? (
                                <img
                                  src={resolveMediaUrl(image.imageUrl)}
                                  alt={image.title || albumDetail.album.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-secondary/60">
                                  <ImageIcon className="h-12 w-12" />
                                </div>
                              )}

                              {image.title && (
                                <div
                                  className={`absolute inset-x-0 bottom-0 px-5 py-4 text-white transition-all duration-300 ${
                                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                  <div className="relative text-sm sm:text-base font-semibold">
                                    {image.title}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      nextSlide()
                      resetAutoPlay()
                    }}
                    className="md:p-2 p-1 bg-black/30 md:ml-6 ml-2 rounded-full hover:bg-black/50 text-white"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {images.map((image, index) => {
                    const imageId = image.id || image._id
                    const isActive = index === currentSlide
                    return (
                      <button
                        key={imageId}
                        type="button"
                        onClick={() => {
                          goToSlide(index)
                          resetAutoPlay()
                        }}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          isActive ? 'bg-primary w-6' : 'bg-primary/30 hover:bg-primary/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
