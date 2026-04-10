import { useEffect, useMemo, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload, X, XCircle, Trash2, Pencil, Save } from 'lucide-react'
import { createNews, fetchAdminNews, uploadNewsImage, approveNews, rejectNews, removeNews, updateNews } from '../../services/newsService'
import type { NewsDto } from '../../types'
import { resolveMediaUrl } from '../../utils/media'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ActionButton from '../../components/ui/ActionButton'
import { hasFieldErrors, parseApiValidationErrors, validateNewsForm } from '../../utils/adminValidation'

type NewsFormState = {
  title: string
  summary: string
  content: string
  category: string
  activeStatus: boolean
  publishedAt: string
  imageUrl: string
}

const DEFAULT_CATEGORY_OPTIONS = ['Operations', 'Procurement', 'Planning', 'Reports', 'General']

const getCurrentDateForInput = () => {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

const createInitialFormState = (): NewsFormState => ({
  title: '',
  summary: '',
  content: '',
  category: 'General',
  activeStatus: true,
  publishedAt: getCurrentDateForInput(),
  imageUrl: '',
})

export default function NewsManagementPage() {
  const { user } = useUser()

  const canCreate = canPerformAction(user, RBAC_FUNCTION.NEWS, 'create')
  const canEdit = canPerformAction(user, RBAC_FUNCTION.NEWS, 'edit')
  const canDelete = canPerformAction(user, RBAC_FUNCTION.NEWS, 'delete')
  const canApprove = canPerformAction(user, RBAC_FUNCTION.NEWS, 'approve')

  const [form, setForm] = useState<NewsFormState>(createInitialFormState)
  const [newsItems, setNewsItems] = useState<NewsDto[]>([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORY_OPTIONS)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof NewsFormState, string>>>({})
  const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<keyof NewsFormState, string>>>({})

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsDto | null>(null)
  const [editForm, setEditForm] = useState<NewsFormState>(createInitialFormState)
  const [editUploading, setEditUploading] = useState(false)
  const [confirmingAction, setConfirmingAction] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description: string
    confirmLabel: string
    intent: 'primary' | 'success' | 'warning' | 'danger'
    onConfirm: () => Promise<void>
  } | null>(null)

  const sortedRecentNews = useMemo(
    () =>
      [...newsItems]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 6),
    [newsItems]
  )

  const loadNews = async () => {
    try {
      setLoadingNews(true)
      const data = await fetchAdminNews()
      setNewsItems(data)
      const fromNews = data
        .map((item) => (item.category || '').trim())
        .filter((item) => item.length > 0)
      const mergedCategories = Array.from(new Set([...DEFAULT_CATEGORY_OPTIONS, ...fromNews])).sort((a, b) =>
        a.localeCompare(b)
      )
      setCategoryOptions(mergedCategories)
    } catch (err) {
      setError('Failed to load news items.')
    } finally {
      setLoadingNews(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  const handleChange = (field: keyof NewsFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      setError('')
      const imageUrl = await uploadNewsImage(file)
      setForm((prev) => ({ ...prev, imageUrl }))
      setFieldErrors((prev) => {
        if (!prev.imageUrl) return prev
        const next = { ...prev }
        delete next.imageUrl
        return next
      })
      setSuccess('Image uploaded successfully.')
    } catch (err) {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const resetForm = () => {
    setForm(createInitialFormState())
    setFieldErrors({})
  }

  const inputClassName = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
      hasError ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-border focus:ring-primary'
    }`

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    if (!canCreate) {
      setError('You do not have permission to create news.')
      return
    }

    const validationErrors = validateNewsForm(form)
    if (hasFieldErrors(validationErrors)) {
      setFieldErrors(validationErrors)
      setError('Please correct the highlighted fields and try again.')
      return
    }

    try {
      setSubmitting(true)
      const created = await createNews({
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        activeStatus: form.activeStatus,
        publishedAt: form.publishedAt,
      })

      setNewsItems((prev) => [created, ...prev])
      setCategoryOptions((prev) => {
        const merged = Array.from(new Set([...prev, created.category.trim()])).sort((a, b) => a.localeCompare(b))
        return merged
      })
      setSuccess('News item created successfully. It is pending approval.')
      resetForm()
    } catch (err: any) {
      const parsed = parseApiValidationErrors(err)
      setFieldErrors(parsed.fieldErrors as Partial<Record<keyof NewsFormState, string>>)
      setError(parsed.message || 'Failed to create news item.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    if (!canApprove) {
      setError('You do not have permission to approve news.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [itemId]: true }))
      setError('')
      const approved = await approveNews(itemId)
      setNewsItems((prev) => prev.map((item) => ((item.id || item._id) === itemId ? approved : item)))
      setSuccess('News item approved successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to approve news.'
      setError(message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const handleRejectClick = (itemId: string) => {
    setRejectingItemId(itemId)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectingItemId || !canApprove) return

    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [rejectingItemId]: true }))
      setError('')
      const rejected = await rejectNews(rejectingItemId, rejectionReason.trim())
      setNewsItems((prev) => prev.map((item) => ((item.id || item._id) === rejectingItemId ? rejected : item)))
      setSuccess('News item rejected.')
      setRejectModalOpen(false)
      setRejectingItemId(null)
      setRejectionReason('')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to reject news.'
      setError(message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [rejectingItemId]: false }))
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete news.')
      return
    }

    setConfirmState({
      title: 'Delete News Item',
      description: 'Are you sure you want to delete this news item? This action cannot be undone.',
      confirmLabel: 'Delete',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading((prev) => ({ ...prev, [itemId]: true }))
          setError('')
          await removeNews(itemId)
          setNewsItems((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
          setSuccess('News item deleted successfully.')
        } catch (err: any) {
          const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete news.'
          setError(message)
        } finally {
          setActionLoading((prev) => ({ ...prev, [itemId]: false }))
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

  // Edit handlers
  const handleEditClick = (item: NewsDto) => {
    setEditingItem(item)
    setEditForm({
      title: item.title || '',
      summary: item.summary || item.excerpt || '',
      content: item.content || '',
      category: item.category || 'General',
      activeStatus: item.activeStatus ?? true,
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : getCurrentDateForInput(),
      imageUrl: item.imageUrl || '',
    })
    setEditModalOpen(true)
  }

  const handleEditChange = (field: keyof NewsFormState, value: string | boolean) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
    setEditFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setEditUploading(true)
      setError('')
      const imageUrl = await uploadNewsImage(file)
      setEditForm((prev) => ({ ...prev, imageUrl }))
      setEditFieldErrors((prev) => {
        if (!prev.imageUrl) return prev
        const next = { ...prev }
        delete next.imageUrl
        return next
      })
      setSuccess('Image uploaded successfully.')
    } catch (err) {
      setError('Image upload failed. Please try again.')
    } finally {
      setEditUploading(false)
      event.target.value = ''
    }
  }

  const handleEditSubmit = async () => {
    if (!editingItem || !canEdit) return

    const itemId = editingItem.id || editingItem._id
    if (!itemId) return

    setEditFieldErrors({})
    const validationErrors = validateNewsForm(editForm)
    if (hasFieldErrors(validationErrors)) {
      setEditFieldErrors(validationErrors)
      setError('Please correct the highlighted fields before saving.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [itemId]: true }))
      setError('')
      const updated = await updateNews(itemId, {
        title: editForm.title.trim(),
        summary: editForm.summary.trim(),
        content: editForm.content.trim(),
        category: editForm.category.trim(),
        imageUrl: editForm.imageUrl.trim() || undefined,
        activeStatus: editForm.activeStatus,
        publishedAt: editForm.publishedAt,
      })
      setNewsItems((prev) => prev.map((item) => ((item.id || item._id) === itemId ? updated : item)))
      setSuccess('News item updated successfully. Re-approval may be required.')
      setEditModalOpen(false)
      setEditingItem(null)
    } catch (err: any) {
      const parsed = parseApiValidationErrors(err)
      setEditFieldErrors(parsed.fieldErrors as Partial<Record<keyof NewsFormState, string>>)
      setError(parsed.message || 'Failed to update news.')
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingItem(null)
    setEditForm(createInitialFormState())
    setEditFieldErrors({})
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="News Management"
        subtitle="Create and manage news articles with RBAC control"
        icon={FileText}
      />

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-base font-bold text-secondary mb-2">Your Permissions</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>View News: <strong>Yes</strong></p>
              <p>Create News: <strong>{canCreate ? 'Yes' : 'No'}</strong></p>
              <p>Edit News: <strong>{canEdit ? 'Yes' : 'No'}</strong></p>
              <p>Delete News: <strong>{canDelete ? 'Yes' : 'No'}</strong></p>
              <p>Approve News: <strong>{canApprove ? 'Yes' : 'No'}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-secondary mb-4">Add News</h3>

          {!canCreate && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              You do not have create permission for News. Contact a SuperAdmin if you need access.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={!canCreate || submitting}
                className={inputClassName(Boolean(fieldErrors.title))}
                placeholder="Enter news title"
              />
              {fieldErrors.title ? <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Summary</label>
              <textarea
                value={form.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                disabled={!canCreate || submitting}
                rows={3}
                className={inputClassName(Boolean(fieldErrors.summary))}
                placeholder="Short summary for cards and preview"
              />
              {fieldErrors.summary ? <p className="mt-1 text-xs text-red-600">{fieldErrors.summary}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => handleChange('content', e.target.value)}
                disabled={!canCreate || submitting}
                rows={8}
                className={inputClassName(Boolean(fieldErrors.content))}
                placeholder="Write the full article content"
              />
              {fieldErrors.content ? <p className="mt-1 text-xs text-red-600">{fieldErrors.content}</p> : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={!canCreate || submitting}
                  className={inputClassName(Boolean(fieldErrors.category))}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {fieldErrors.category ? <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Publish At</label>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => handleChange('publishedAt', e.target.value)}
                  disabled={!canCreate || submitting}
                  className={inputClassName(Boolean(fieldErrors.publishedAt))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Image</label>
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Choose one method: upload from computer OR paste an image URL.</p>
                <div className="flex gap-2">
                  <label className="flex-1 h-10 px-4 border border-border rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span className="text-sm text-gray-700">{uploadingImage ? 'Uploading...' : 'Upload from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={!canCreate || submitting || uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  disabled={!canCreate || submitting}
                  className={inputClassName(Boolean(fieldErrors.imageUrl))}
                  placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                />
                {fieldErrors.imageUrl ? <p className="mt-1 text-xs text-red-600">{fieldErrors.imageUrl}</p> : null}

                {form.imageUrl && (
                  <div className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Image Preview</p>
                      {canCreate && (
                        <button
                          type="button"
                          onClick={() => handleChange('imageUrl', '')}
                          className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </div>
                    <img src={resolveMediaUrl(form.imageUrl)} alt="News preview" className="w-full h-44 object-cover rounded-md" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={form.activeStatus}
                  onChange={(e) => handleChange('activeStatus', e.target.checked)}
                  disabled={!canCreate || submitting}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                Active Status
              </label>

              <button
                type="submit"
                disabled={!canCreate || submitting || uploadingImage}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Creating...' : 'Create News'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-secondary mb-4">Recent News</h3>

          {loadingNews ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sortedRecentNews.length === 0 ? (
            <p className="text-sm text-gray-500">No news items yet. Create your first post.</p>
          ) : (
            <div className="space-y-3 max-h-[780px] overflow-auto pr-1">
              {sortedRecentNews.map((item) => {
                const id = item.id || item._id || item.title
                const isProcessing = actionLoading[id] || false
                return (
                  <article key={id} className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-secondary text-sm leading-5 line-clamp-2">{item.title}</h4>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ${
                          item.approved
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.rejected
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.approved ? 'Approved' : item.rejected ? 'Rejected' : 'Pending'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">{item.category}</p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.summary || item.excerpt || '-'}</p>

                    {item.rejected && item.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        <strong>Rejection reason:</strong> {item.rejectionReason}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-gray-500">
                        {new Date(item.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <ActionButton
                            label="Edit"
                            onClick={() => handleEditClick(item)}
                            disabled={isProcessing}
                            icon={Pencil}
                            variant="edit"
                            size="xs"
                          />
                        )}

                        {!item.approved && !item.rejected && canApprove && (
                          <>
                            <ActionButton
                              label={isProcessing ? 'Approving...' : 'Approve'}
                              onClick={() => handleApprove(id)}
                              disabled={isProcessing}
                              icon={isProcessing ? Loader2 : CheckCircle2}
                              variant="approve"
                              size="xs"
                              className={isProcessing ? '[&>svg]:animate-spin' : ''}
                            />
                            <ActionButton
                              label="Reject"
                              onClick={() => handleRejectClick(id)}
                              disabled={isProcessing}
                              icon={XCircle}
                              variant="reject"
                              size="xs"
                            />
                          </>
                        )}

                        {canDelete && (
                          <ActionButton
                            label={isProcessing ? 'Deleting...' : 'Delete'}
                            onClick={() => handleDelete(id)}
                            disabled={isProcessing}
                            icon={isProcessing ? Loader2 : Trash2}
                            variant="delete"
                            size="xs"
                            className={isProcessing ? '[&>svg]:animate-spin' : ''}
                          />
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>

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

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-secondary mb-4">Reject News Item</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this news item:</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter rejection reason..."
            />

            <div className="mt-6 flex gap-2 justify-end">
              <ActionButton
                label="Cancel"
                onClick={() => {
                  setRejectModalOpen(false)
                  setRejectingItemId(null)
                  setRejectionReason('')
                }}
                variant="neutral"
              />
              <ActionButton
                label={rejectingItemId && actionLoading[rejectingItemId] ? 'Rejecting...' : 'Reject News'}
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim() || (rejectingItemId ? actionLoading[rejectingItemId] : false)}
                icon={rejectingItemId && actionLoading[rejectingItemId] ? Loader2 : XCircle}
                variant="reject"
                className={rejectingItemId && actionLoading[rejectingItemId] ? '[&>svg]:animate-spin' : ''}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Pencil className="h-5 w-5 text-primary" />
                <span className="font-semibold text-secondary">Edit News</span>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className={inputClassName(Boolean(editFieldErrors.title))}
                  placeholder="Enter news title"
                />
                {editFieldErrors.title ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.title}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Summary</label>
                <textarea
                  value={editForm.summary}
                  onChange={(e) => handleEditChange('summary', e.target.value)}
                  rows={3}
                  className={inputClassName(Boolean(editFieldErrors.summary))}
                  placeholder="Short summary for cards and preview"
                />
                {editFieldErrors.summary ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.summary}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => handleEditChange('content', e.target.value)}
                  rows={8}
                  className={inputClassName(Boolean(editFieldErrors.content))}
                  placeholder="Write the full article content"
                />
                {editFieldErrors.content ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.content}</p> : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => handleEditChange('category', e.target.value)}
                    className={inputClassName(Boolean(editFieldErrors.category))}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {editFieldErrors.category ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.category}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={editForm.publishedAt}
                    onChange={(e) => handleEditChange('publishedAt', e.target.value)}
                    className={inputClassName(Boolean(editFieldErrors.publishedAt))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Image</label>
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Choose one method: upload from computer OR paste an image URL.</p>
                  <div className="flex gap-2">
                    <label className="flex-1 h-10 px-4 border border-border rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                      {editUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span className="text-sm text-gray-700">{editUploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        disabled={editUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <input
                    type="text"
                    value={editForm.imageUrl}
                    onChange={(e) => handleEditChange('imageUrl', e.target.value)}
                    className={inputClassName(Boolean(editFieldErrors.imageUrl))}
                    placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                  />
                  {editFieldErrors.imageUrl ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.imageUrl}</p> : null}

                  {editForm.imageUrl && (
                    <div className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Image Preview</p>
                        <button
                          type="button"
                          onClick={() => handleEditChange('imageUrl', '')}
                          className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                      <img src={resolveMediaUrl(editForm.imageUrl)} alt="News preview" className="w-full h-44 object-cover rounded-md" />
                    </div>
                  )}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={editForm.activeStatus}
                  onChange={(e) => handleEditChange('activeStatus', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                Active Status
              </label>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-border px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <ActionButton
                label="Cancel"
                onClick={closeEditModal}
                variant="neutral"
                size="md"
              />
              <ActionButton
                label={editingItem && actionLoading[editingItem.id || editingItem._id || ''] ? 'Saving...' : 'Save Changes'}
                onClick={handleEditSubmit}
                disabled={editUploading || (editingItem ? actionLoading[editingItem.id || editingItem._id || ''] : false)}
                icon={editingItem && actionLoading[editingItem.id || editingItem._id || ''] ? Loader2 : Save}
                variant="primary"
                size="md"
                className={editingItem && actionLoading[editingItem.id || editingItem._id || ''] ? '[&>svg]:animate-spin' : ''}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
