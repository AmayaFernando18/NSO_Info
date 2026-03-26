import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Image,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
  XCircle,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import {
  approveHeroSlide,
  createHeroSlide,
  deleteHeroSlide,
  fetchAdminHeroSlides,
  reorderHeroSlides,
  updateHeroSlide,
  uploadHeroImage,
  type HeroSlideInput,
} from '../../services/heroSlidesService'
import type { HeroCarouselImageDto } from '../../types'
import { resolveMediaUrl } from '../../utils/media'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

type HeroFormState = {
  title: string
  description: string
  imageUrl: string
  activeStatus: boolean
}

const initialForm: HeroFormState = {
  title: '',
  description: '',
  imageUrl: '',
  activeStatus: true,
}

export default function HeroManagementPage() {
  const { user } = useUser()
  const canCreate = canPerformAction(user, RBAC_FUNCTION.HERO, 'create')
  const canEdit = canPerformAction(user, RBAC_FUNCTION.HERO, 'edit')
  const canDelete = canPerformAction(user, RBAC_FUNCTION.HERO, 'delete')
  const canApprove = canPerformAction(user, RBAC_FUNCTION.HERO, 'approve')

  const [slides, setSlides] = useState<HeroCarouselImageDto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingRowId, setSavingRowId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState<HeroFormState>(initialForm)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<HeroFormState>(initialForm)

  useEffect(() => {
    void loadSlides()
  }, [])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(''), 2500)
    return () => clearTimeout(t)
  }, [success])

  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [slides]
  )

  const loadSlides = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminHeroSlides()
      setSlides(data || [])
      setError('')
    } catch {
      setError('Failed to load hero slides.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => setForm(initialForm)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 'create' | 'edit') => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const imageUrl = await uploadHeroImage(file)
      if (target === 'create') {
        setForm((prev) => ({ ...prev, imageUrl }))
      } else {
        setEditDraft((prev) => ({ ...prev, imageUrl }))
      }
      setSuccess('Image uploaded successfully.')
    } catch {
      setError('Image upload failed.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) {
      setError('You do not have permission to add hero slides.')
      return
    }

    if (!form.title.trim() || !form.description.trim() || !form.imageUrl.trim()) {
      setError('Title, description, and image are required.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const payload: HeroSlideInput = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        activeStatus: form.activeStatus,
        order: orderedSlides.length + 1,
      }
      await createHeroSlide(payload)
      resetForm()
      setSuccess('Hero slide added. Approve it to show on home page.')
      await loadSlides()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to add hero slide.')
    } finally {
      setSubmitting(false)
    }
  }

  const beginEdit = (slide: HeroCarouselImageDto) => {
    const id = slide.id || slide._id
    if (!id) return
    setEditingId(id)
    setEditDraft({
      title: slide.title || '',
      description: slide.description || '',
      imageUrl: slide.imageUrl || '',
      activeStatus: slide.activeStatus ?? true,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft(initialForm)
  }

  const saveEdit = async (id: string) => {
    if (!canEdit) {
      setError('You do not have permission to edit hero slides.')
      return
    }

    if (!editDraft.title.trim() || !editDraft.description.trim() || !editDraft.imageUrl.trim()) {
      setError('Title, description, and image are required.')
      return
    }

    try {
      setSavingRowId(id)
      setError('')
      await updateHeroSlide(id, {
        title: editDraft.title.trim(),
        description: editDraft.description.trim(),
        imageUrl: editDraft.imageUrl.trim(),
        activeStatus: editDraft.activeStatus,
      })
      setSuccess('Hero slide updated. Re-approve to publish changes.')
      cancelEdit()
      await loadSlides()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update hero slide.')
    } finally {
      setSavingRowId(null)
    }
  }

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    if (!canEdit) {
      setError('You do not have permission to reorder slides.')
      return
    }

    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= orderedSlides.length) return

    const next = [...orderedSlides]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)

    const orderedIds = next
      .map((slide) => slide.id || slide._id)
      .filter((id): id is string => Boolean(id))

    if (orderedIds.length !== next.length) {
      setError('Cannot reorder due to invalid slide id.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const data = await reorderHeroSlides(orderedIds)
      setSlides(data)
      setSuccess('Slide order updated.')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reorder slides.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!canApprove) return
    try {
      setSavingRowId(id)
      await approveHeroSlide(id)
      setSuccess('Hero slide approved and now available for home page.')
      await loadSlides()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to approve slide.')
    } finally {
      setSavingRowId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete slides.')
      return
    }
    if (!confirm('Delete this hero slide?')) return

    try {
      setSavingRowId(id)
      await deleteHeroSlide(id)
      setSuccess('Hero slide deleted.')
      await loadSlides()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete hero slide.')
    } finally {
      setSavingRowId(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Hero Slides Management"
        subtitle="Manage hero carousel images, content, and display order"
        icon={Image}
        actions={
          <button
            onClick={() => void loadSlides()}
            disabled={loading}
            className="px-4 py-2.5 border border-border bg-white rounded-lg inline-flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Notifications */}
      {(error || success) && (
        <div className="space-y-2">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>
      )}

      {/* Permissions Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Image className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-base font-semibold text-purple-900">Your Permissions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'View', allowed: true },
            { label: 'Create', allowed: canCreate },
            { label: 'Edit & Reorder', allowed: canEdit },
            { label: 'Delete', allowed: canDelete },
            { label: 'Approve', allowed: canApprove },
          ].map((perm) => (
            <div key={perm.label} className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${perm.allowed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className={perm.allowed ? 'text-purple-800' : 'text-gray-500'}>{perm.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add Hero Slide Form */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-xl border border-border shadow-sm sticky top-6">
            <div className="p-4 border-b border-border">
              <h3 className="text-base font-semibold text-secondary flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add New Slide
              </h3>
            </div>

            <div className="p-5">
              {!canCreate && (
                <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  No permission to add slides
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={!canCreate || submitting}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="Slide title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    disabled={!canCreate || submitting}
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                    placeholder="Slide description"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    Image
                  </label>
                  {form.imageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={resolveMediaUrl(form.imageUrl)}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                      />
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-xs font-medium flex items-center gap-1">
                          <Upload className="h-4 w-4" />
                          Replace
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void handleUpload(e, 'create')}
                          disabled={!canCreate || submitting || uploading}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-gray-50 transition-colors">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Click to upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleUpload(e, 'create')}
                        disabled={!canCreate || submitting || uploading}
                      />
                    </label>
                  )}
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.activeStatus}
                    onChange={(e) => setForm((prev) => ({ ...prev, activeStatus: e.target.checked }))}
                    disabled={!canCreate || submitting}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-700">Active status</span>
                </label>

                <button
                  type="submit"
                  disabled={!canCreate || submitting || uploading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Slide
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Slides List */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-secondary flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                Slides ({orderedSlides.length})
              </h3>
              {orderedSlides.length > 0 && (
                <span className="text-xs text-gray-500">Drag order: Top = First shown</span>
              )}
            </div>

            <div className="p-5">
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
                  <p className="mt-3 text-sm text-gray-500">Loading slides...</p>
                </div>
              ) : orderedSlides.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No hero slides yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add your first slide using the form</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderedSlides.map((slide, index) => {
                    const id = slide.id || slide._id || ''
                    const isEditing = editingId === id
                    const isSavingRow = savingRowId === id

                    return (
                      <div
                        key={id || `${slide.title}-${index}`}
                        className={`rounded-xl border transition-all ${
                          isEditing ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'
                        }`}
                      >
                        {/* Card Header - Order & Actions */}
                        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-semibold">
                              {slide.order}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                slide.activeStatus ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {slide.activeStatus ? 'Active' : 'Inactive'}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                slide.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {slide.approved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          {!isEditing && canEdit && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => void moveSlide(index, 'up')}
                                disabled={index === 0 || submitting}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <ArrowUp className="h-4 w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => void moveSlide(index, 'down')}
                                disabled={index === orderedSlides.length - 1 || submitting}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <ArrowDown className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4">
                          {isEditing ? (
                            /* Edit Mode */
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                                {/* Image Preview & Upload */}
                                <div className="relative rounded-lg overflow-hidden border border-border aspect-video md:aspect-[4/3]">
                                  <img
                                    src={resolveMediaUrl(editDraft.imageUrl)}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                      Replace Image
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => void handleUpload(e, 'edit')}
                                      disabled={uploading || isSavingRow}
                                    />
                                  </label>
                                </div>

                                {/* Edit Fields */}
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                      Title
                                    </label>
                                    <input
                                      value={editDraft.title}
                                      onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))}
                                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                      placeholder="Slide title"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                      Description
                                    </label>
                                    <textarea
                                      value={editDraft.description}
                                      onChange={(e) => setEditDraft((prev) => ({ ...prev, description: e.target.value }))}
                                      rows={3}
                                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                      placeholder="Slide description"
                                    />
                                  </div>
                                  <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={editDraft.activeStatus}
                                      onChange={(e) => setEditDraft((prev) => ({ ...prev, activeStatus: e.target.checked }))}
                                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-sm text-gray-700">Active status</span>
                                  </label>
                                </div>
                              </div>

                              {/* Edit Actions */}
                              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                                <button
                                  onClick={cancelEdit}
                                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                  Cancel
                                </button>
                                <button
                                  onClick={() => void saveEdit(id)}
                                  disabled={isSavingRow}
                                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-60 hover:bg-primary/90 transition-colors"
                                >
                                  {isSavingRow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <div className="flex flex-col sm:flex-row gap-4">
                              <img
                                src={resolveMediaUrl(slide.imageUrl)}
                                alt={slide.title}
                                className="w-full sm:w-44 h-28 object-cover rounded-lg flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-secondary text-base mb-1.5 truncate">
                                  {slide.title}
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                  {slide.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  {canEdit && (
                                    <button
                                      onClick={() => beginEdit(slide)}
                                      className="px-3.5 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 transition-colors"
                                    >
                                      <Save className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                  {!slide.approved && canApprove && (
                                    <button
                                      onClick={() => void handleApprove(id)}
                                      disabled={isSavingRow}
                                      className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-60 hover:bg-emerald-700 transition-colors"
                                    >
                                      {isSavingRow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                      Approve
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      onClick={() => void handleDelete(id)}
                                      disabled={isSavingRow}
                                      className="px-3.5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-60 hover:bg-red-700 transition-colors"
                                    >
                                      {isSavingRow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {!canApprove && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            New or edited slides remain pending until approved by a user with Approve access.
          </p>
        </div>
      )}
    </div>
  )
}
