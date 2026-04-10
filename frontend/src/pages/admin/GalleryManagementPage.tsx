import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Image,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { useUser } from '../../context/UserContext'
import { RBAC_FUNCTION } from '../../constants/rbac'
import { canPerformAction } from '../../utils/rbac'
import {
  createGalleryAlbum,
  createGalleryImage,
  deleteGalleryAlbum,
  deleteGalleryImage,
  fetchAdminGalleryAlbums,
  fetchAdminGalleryImages,
  updateGalleryAlbum,
  updateGalleryImage,
  uploadGalleryImage,
} from '../../services/galleryService'
import type { GalleryAlbumDto, GalleryImageDto } from '../../types'
import { resolveMediaUrl } from '../../utils/media'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

type AlbumFormState = {
  name: string
  description: string
  coverImageUrl: string
  displayOrder: number
  activeStatus: boolean
}

type ImageFormState = {
  caption: string
  imageUrl: string
  displayOrder: number
  activeStatus: boolean
}

const initialAlbumForm: AlbumFormState = {
  name: '',
  description: '',
  coverImageUrl: '',
  displayOrder: 0,
  activeStatus: true,
}

const initialImageForm: ImageFormState = {
  caption: '',
  imageUrl: '',
  displayOrder: 0,
  activeStatus: true,
}

export default function GalleryManagementPage() {
  const { user } = useUser()

  const canCreate = canPerformAction(user, RBAC_FUNCTION.GALLERY, 'create')
  const canEdit = canPerformAction(user, RBAC_FUNCTION.GALLERY, 'edit')
  const canDelete = canPerformAction(user, RBAC_FUNCTION.GALLERY, 'delete')

  const [albums, setAlbums] = useState<GalleryAlbumDto[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState('')
  const [images, setImages] = useState<GalleryImageDto[]>([])

  const [albumForm, setAlbumForm] = useState<AlbumFormState>(initialAlbumForm)
  const [imageForm, setImageForm] = useState<ImageFormState>(initialImageForm)

  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)

  const [albumModalOpen, setAlbumModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  const [loadingAlbums, setLoadingAlbums] = useState(true)
  const [loadingImages, setLoadingImages] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'album' | 'image' | null>(null)
  const [movingAlbumId, setMovingAlbumId] = useState<string | null>(null)
  const [movingImageId, setMovingImageId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmingAction, setConfirmingAction] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description: string
    confirmLabel: string
    intent: 'primary' | 'success' | 'warning' | 'danger'
    onConfirm: () => Promise<void>
  } | null>(null)

  const orderedAlbums = useMemo(
    () => [...albums].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [albums]
  )

  const orderedImages = useMemo(
    () => [...images].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [images]
  )

  const selectedAlbum = useMemo(
    () => orderedAlbums.find((album) => (album.id || album._id) === selectedAlbumId) || null,
    [orderedAlbums, selectedAlbumId]
  )

  const visibleAlbums = useMemo(() => {
    if (!selectedAlbumId) return orderedAlbums
    return orderedAlbums.filter((album) => (album.id || album._id) === selectedAlbumId)
  }, [orderedAlbums, selectedAlbumId])

  useEffect(() => {
    void loadAlbums()
  }, [])

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 2800)
    return () => clearTimeout(timer)
  }, [success])

  useEffect(() => {
    if (!selectedAlbumId) {
      setImages([])
      return
    }
    void loadImages(selectedAlbumId)
  }, [selectedAlbumId])

  const loadAlbums = async () => {
    try {
      setLoadingAlbums(true)
      const data = await fetchAdminGalleryAlbums()
      const list = [...(data || [])].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
      setAlbums(list)

      if (list.length === 0) {
        setSelectedAlbumId('')
      } else if (selectedAlbumId && !list.some((album) => (album.id || album._id) === selectedAlbumId)) {
        setSelectedAlbumId('')
      }

      setError('')
    } catch {
      setError('Failed to load gallery albums.')
      setAlbums([])
    } finally {
      setLoadingAlbums(false)
    }
  }

  const loadImages = async (albumId: string) => {
    try {
      setLoadingImages(true)
      const data = await fetchAdminGalleryImages(albumId)
      setImages([...(data || [])].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)))
      setError('')
    } catch {
      setError('Failed to load images for selected album.')
      setImages([])
    } finally {
      setLoadingImages(false)
    }
  }

  const closeAlbumModal = () => {
    setAlbumModalOpen(false)
    setEditingAlbumId(null)
    setAlbumForm(initialAlbumForm)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setEditingImageId(null)
    setImageForm(initialImageForm)
  }

  const openCreateAlbumModal = () => {
    if (!canCreate) {
      setError('You do not have permission to create albums.')
      return
    }

    const nextOrder = orderedAlbums.length > 0
      ? Math.max(...orderedAlbums.map((album) => Number(album.displayOrder || 0))) + 1
      : 0

    setEditingAlbumId(null)
    setAlbumForm({ ...initialAlbumForm, displayOrder: nextOrder })
    setAlbumModalOpen(true)
  }

  const openEditAlbumModal = (album: GalleryAlbumDto) => {
    if (!canEdit) {
      setError('You do not have permission to edit albums.')
      return
    }

    const albumId = album.id || album._id
    if (!albumId) return

    setEditingAlbumId(albumId)
    setAlbumForm({
      name: album.name || '',
      description: album.description || '',
      coverImageUrl: album.coverImageUrl || '',
      displayOrder: Number(album.displayOrder || 0),
      activeStatus: album.activeStatus !== false,
    })
    setAlbumModalOpen(true)
  }

  const openCreateImageModal = () => {
    if (!selectedAlbumId) {
      setError('Select an album before adding images.')
      return
    }
    if (!canCreate) {
      setError('You do not have permission to add images.')
      return
    }

    const nextOrder = orderedImages.length > 0
      ? Math.max(...orderedImages.map((image) => Number(image.displayOrder || 0))) + 1
      : 0

    setEditingImageId(null)
    setImageForm({ ...initialImageForm, displayOrder: nextOrder })
    setImageModalOpen(true)
  }

  const openEditImageModal = (image: GalleryImageDto) => {
    if (!canEdit) {
      setError('You do not have permission to edit images.')
      return
    }

    const imageId = image.id || image._id
    if (!imageId) return

    setEditingImageId(imageId)
    setImageForm({
      caption: image.title || '',
      imageUrl: image.imageUrl || '',
      displayOrder: Number(image.displayOrder || 0),
      activeStatus: image.activeStatus !== false,
    })
    setImageModalOpen(true)
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 'album' | 'image') => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(target)
      const imageUrl = await uploadGalleryImage(file)

      if (target === 'album') {
        setAlbumForm((prev) => ({ ...prev, coverImageUrl: imageUrl }))
      } else {
        setImageForm((prev) => ({ ...prev, imageUrl }))
      }

      setSuccess('Image uploaded successfully.')
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploading(null)
      event.target.value = ''
    }
  }

  const handleAlbumSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!albumForm.name.trim()) {
      setError('Album name is required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: albumForm.name.trim(),
        description: albumForm.description.trim(),
        coverImageUrl: albumForm.coverImageUrl.trim(),
        displayOrder: Number(albumForm.displayOrder || 0),
        activeStatus: albumForm.activeStatus,
      }

      if (editingAlbumId) {
        await updateGalleryAlbum(editingAlbumId, payload)
        setSuccess('Album updated successfully.')
      } else {
        await createGalleryAlbum(payload)
        setSuccess('Album created successfully.')
      }

      await loadAlbums()
      closeAlbumModal()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save album.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedAlbumId) {
      setError('Select an album before adding images.')
      return
    }

    if (!imageForm.imageUrl.trim()) {
      setError('Provide an image URL or upload an image.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        title: imageForm.caption.trim(),
        imageUrl: imageForm.imageUrl.trim(),
        displayOrder: Number(imageForm.displayOrder || 0),
        activeStatus: imageForm.activeStatus,
      }

      if (editingImageId) {
        await updateGalleryImage(editingImageId, payload)
        setSuccess('Image updated successfully.')
      } else {
        await createGalleryImage(selectedAlbumId, payload)
        setSuccess('Image added to album.')
      }

      await loadImages(selectedAlbumId)
      await loadAlbums()
      closeImageModal()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save image.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAlbum = async (albumId: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete albums.')
      return
    }

    setConfirmState({
      title: 'Delete Album',
      description: 'Delete this album and all of its images? This action cannot be undone.',
      confirmLabel: 'Delete Album',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true)
          setError('')
          await deleteGalleryAlbum(albumId)
          setSuccess('Album deleted successfully.')
          await loadAlbums()
        } catch (err: any) {
          setError(err?.response?.data?.error || 'Failed to delete album.')
        } finally {
          setSaving(false)
        }
      },
    })
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete images.')
      return
    }

    setConfirmState({
      title: 'Delete Image',
      description: 'Delete this image from the selected album? This action cannot be undone.',
      confirmLabel: 'Delete Image',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true)
          setError('')
          await deleteGalleryImage(imageId)
          setSuccess('Image deleted successfully.')
          if (selectedAlbumId) {
            await loadImages(selectedAlbumId)
            await loadAlbums()
          }
        } catch (err: any) {
          setError(err?.response?.data?.error || 'Failed to delete image.')
        } finally {
          setSaving(false)
        }
      },
    })
  }

  const closeConfirmDialog = () => {
    if (confirmingAction) return
    setConfirmState(null)
  }

  const handleConfirmDialog = async () => {
    if (!confirmState) return

    try {
      setConfirmingAction(true)
      await confirmState.onConfirm()
      setConfirmState(null)
    } finally {
      setConfirmingAction(false)
    }
  }

  const moveAlbum = async (albumId: string, direction: 'up' | 'down') => {
    if (!canEdit) {
      setError('You do not have permission to reorder albums.')
      return
    }

    const index = orderedAlbums.findIndex((item) => (item.id || item._id) === albumId)
    if (index < 0) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= orderedAlbums.length) return

    const current = orderedAlbums[index]
    const target = orderedAlbums[targetIndex]

    const currentId = current.id || current._id
    const targetId = target.id || target._id
    if (!currentId || !targetId) return

    try {
      setMovingAlbumId(albumId)
      setError('')

      await Promise.all([
        updateGalleryAlbum(currentId, { displayOrder: Number(target.displayOrder || 0) }),
        updateGalleryAlbum(targetId, { displayOrder: Number(current.displayOrder || 0) }),
      ])

      setSuccess('Album order updated.')
      await loadAlbums()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reorder albums.')
    } finally {
      setMovingAlbumId(null)
    }
  }

  const moveImage = async (imageId: string, direction: 'up' | 'down') => {
    if (!canEdit) {
      setError('You do not have permission to reorder images.')
      return
    }

    const index = orderedImages.findIndex((item) => (item.id || item._id) === imageId)
    if (index < 0) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= orderedImages.length) return

    const current = orderedImages[index]
    const target = orderedImages[targetIndex]

    const currentId = current.id || current._id
    const targetId = target.id || target._id
    if (!currentId || !targetId) return

    try {
      setMovingImageId(imageId)
      setError('')

      await Promise.all([
        updateGalleryImage(currentId, { displayOrder: Number(target.displayOrder || 0) }),
        updateGalleryImage(targetId, { displayOrder: Number(current.displayOrder || 0) }),
      ])

      setSuccess('Image order updated.')
      if (selectedAlbumId) {
        await loadImages(selectedAlbumId)
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reorder images.')
    } finally {
      setMovingImageId(null)
    }
  }

  const cardBase = 'rounded-xl border border-border bg-white p-4 shadow-sm'
  const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gallery Management"
        subtitle="Create albums, manage images, and arrange the gallery"
        icon={Image}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <section className={cardBase}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-secondary">Albums</h2>
            <p className="text-sm text-gray-500">
              {selectedAlbum ? `Showing: ${selectedAlbum.name}` : 'Select an album to manage its images.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedAlbumId && (
              <button
                type="button"
                onClick={() => setSelectedAlbumId('')}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-secondary hover:bg-muted"
              >
                Show all albums
              </button>
            )}
            <button
              type="button"
              onClick={openCreateAlbumModal}
              disabled={!canCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create Album
            </button>
          </div>
        </div>

        {loadingAlbums ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : orderedAlbums.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-gray-500">
            No albums found. Create your first album to start building the gallery.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleAlbums.map((album) => {
              const albumId = album.id || album._id || ''
              const isSelected = selectedAlbumId === albumId
              const albumIndex = orderedAlbums.findIndex((item) => (item.id || item._id) === albumId)

              return (
                <article
                  key={albumId}
                  className={`rounded-xl border transition-all ${
                    isSelected ? 'border-primary bg-primary/[0.04] shadow-md' : 'border-border bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumId(albumId)}
                    className="w-full text-left"
                  >
                    <div className="aspect-[16/10] rounded-t-xl bg-muted overflow-hidden">
                      {album.coverImageUrl ? (
                        <img
                          src={resolveMediaUrl(album.coverImageUrl)}
                          alt={album.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-secondary/50">
                          <Image className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-secondary leading-tight line-clamp-1">{album.name}</h3>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${album.activeStatus === false ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                          {album.activeStatus === false ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{album.description || 'No description provided.'}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{album.imageCount || 0} images</span>
                      </div>
                    </div>
                  </button>

                  <div className="px-3 pb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void moveAlbum(albumId, 'up')}
                        disabled={!canEdit || albumIndex <= 0 || movingAlbumId === albumId}
                        className="p-1.5 rounded-md border border-border text-secondary hover:bg-muted disabled:opacity-50"
                        title="Move up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveAlbum(albumId, 'down')}
                        disabled={!canEdit || albumIndex === orderedAlbums.length - 1 || movingAlbumId === albumId}
                        className="p-1.5 rounded-md border border-border text-secondary hover:bg-muted disabled:opacity-50"
                        title="Move down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditAlbumModal(album)}
                        disabled={!canEdit}
                        className="p-1.5 rounded-md text-primary hover:bg-primary/10 disabled:opacity-50"
                        title="Edit album"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAlbum(albumId)}
                        disabled={!canDelete}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Delete album"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className={cardBase}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-secondary">Album Images</h2>
            <p className="text-sm text-gray-500">
              {selectedAlbum ? `Selected album: ${selectedAlbum.name}` : 'Select an album to manage images.'}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateImageModal}
            disabled={!selectedAlbumId || !canCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </button>
        </div>

        {!selectedAlbumId ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-gray-500">
            Choose an album card above to view and manage its images.
          </div>
        ) : loadingImages ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : orderedImages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-gray-500">
            No images yet for this album. Click Add Image to upload the first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orderedImages.map((image, index) => {
              const imageId = image.id || image._id || ''
              return (
                <article key={imageId} className="rounded-xl border border-border bg-white overflow-hidden">
                  <div className="aspect-[4/3] bg-muted">
                    <img
                      src={resolveMediaUrl(image.imageUrl)}
                      alt={image.title || 'Gallery image'}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-secondary line-clamp-1">{image.title || 'Untitled image'}</h3>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span className={image.activeStatus === false ? 'text-gray-500' : 'text-primary'}>
                        {image.activeStatus === false ? 'Inactive' : 'Active'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void moveImage(imageId, 'up')}
                          disabled={!canEdit || index === 0 || movingImageId === imageId}
                          className="p-1.5 rounded-md border border-border text-secondary hover:bg-muted disabled:opacity-50"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void moveImage(imageId, 'down')}
                          disabled={!canEdit || index === orderedImages.length - 1 || movingImageId === imageId}
                          className="p-1.5 rounded-md border border-border text-secondary hover:bg-muted disabled:opacity-50"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditImageModal(image)}
                          disabled={!canEdit}
                          className="p-1.5 rounded-md text-primary hover:bg-primary/10 disabled:opacity-50"
                          title="Edit image"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteImage(imageId)}
                          disabled={!canDelete}
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {albumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeAlbumModal} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-secondary">{editingAlbumId ? 'Edit Album' : 'Create Album'}</h3>
              <button
                type="button"
                onClick={closeAlbumModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAlbumSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Album Name</label>
                <input
                  value={albumForm.name}
                  onChange={(e) => setAlbumForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                  disabled={saving}
                  placeholder="Enter album name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Description</label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm((prev) => ({ ...prev, description: e.target.value }))}
                  className={inputClass}
                  rows={3}
                  disabled={saving}
                  placeholder="Optional album description"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Cover Image URL or Upload</label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={albumForm.coverImageUrl}
                    onChange={(e) => setAlbumForm((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                    className={inputClass}
                    disabled={saving}
                    placeholder="Paste image URL"
                  />
                  <label className="h-10 px-3 rounded-lg border border-border inline-flex items-center justify-center cursor-pointer hover:bg-muted">
                    {uploading === 'album' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleUpload(e, 'album')}
                      className="hidden"
                      disabled={saving || uploading === 'album'}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={albumForm.activeStatus}
                    onChange={(e) => setAlbumForm((prev) => ({ ...prev, activeStatus: e.target.checked }))}
                    disabled={saving}
                  />
                  Active album
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAlbumModal}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-muted"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAlbumId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingAlbumId ? 'Save Album' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeImageModal} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-secondary">{editingImageId ? 'Edit Image' : 'Add Image'}</h3>
              <button
                type="button"
                onClick={closeImageModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleImageSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Caption (optional)</label>
                <input
                  value={imageForm.caption}
                  onChange={(e) => setImageForm((prev) => ({ ...prev, caption: e.target.value }))}
                  className={inputClass}
                  disabled={saving}
                  placeholder="Image caption"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Image URL or Upload</label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={imageForm.imageUrl}
                    onChange={(e) => setImageForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className={inputClass}
                    disabled={saving}
                    placeholder="Paste image URL"
                  />
                  <label className="h-10 px-3 rounded-lg border border-border inline-flex items-center justify-center cursor-pointer hover:bg-muted">
                    {uploading === 'image' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleUpload(e, 'image')}
                      className="hidden"
                      disabled={saving || uploading === 'image'}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={imageForm.activeStatus}
                    onChange={(e) => setImageForm((prev) => ({ ...prev, activeStatus: e.target.checked }))}
                    disabled={saving}
                  />
                  Active image
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-muted"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingImageId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingImageId ? 'Save Image' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmState)}
        title={confirmState?.title || 'Confirm Action'}
        description={confirmState?.description || ''}
        confirmLabel={confirmState?.confirmLabel || 'Confirm'}
        intent={confirmState?.intent || 'primary'}
        isConfirming={confirmingAction}
        onCancel={closeConfirmDialog}
        onConfirm={() => void handleConfirmDialog()}
      />
    </div>
  )
}
