import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Download, FileText, Loader2, Pencil, Save, Trash2, Upload, X, XCircle } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ActionButton from '../../components/ui/ActionButton'
import ToggleSwitch from '../../components/ui/ToggleSwitch'
import { useUser } from '../../context/UserContext'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import {
  approveDownloadItem,
  createDownloadItem,
  deleteDownloadItem,
  fetchAdminDownloads,
  fetchDeletedDownloads,
  permanentlyDeleteDownloadItem,
  rejectDownloadItem,
  restoreDownloadItem,
  updateDownloadItem,
  uploadDownloadFile,
} from '../../services/downloadsService'
import type { DownloadItemDto } from '../../types'
import { resolveMediaUrl } from '../../utils/media'

const DEFAULT_DOWNLOAD_LANGUAGE = 'Document'
const DOWNLOAD_LANGUAGE_OPTIONS = [DEFAULT_DOWNLOAD_LANGUAGE, 'Sinhala', 'Tamil', 'English']

type DownloadFormState = {
  category: string
  title: string
  language: string
  fileUrl: string
  activeStatus: boolean
}

const createInitialFormState = (): DownloadFormState => ({
  category: '',
  title: '',
  language: '',
  fileUrl: '',
  activeStatus: true,
})

const getDownloadId = (item: DownloadItemDto) => item.id || item._id || ''

const getFileName = (fileUrl: string) => {
  if (!fileUrl) return ''
  const normalized = fileUrl.replace(/\\/g, '/')
  return normalized.split('/').pop() || fileUrl
}

export default function DownloadsManagementPage() {
  const { user } = useUser()
  const canCreate = canPerformAction(user, RBAC_FUNCTION.DOWNLOADS, 'create')
  const canEdit = canPerformAction(user, RBAC_FUNCTION.DOWNLOADS, 'edit')
  const canDelete = canPerformAction(user, RBAC_FUNCTION.DOWNLOADS, 'delete')
  const canApprove = canPerformAction(user, RBAC_FUNCTION.DOWNLOADS, 'approve')

  const [items, setItems] = useState<DownloadItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState<DownloadFormState>(createInitialFormState)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description: string
    confirmLabel: string
    intent: 'primary' | 'success' | 'warning' | 'danger'
    onConfirm: () => Promise<void>
  } | null>(null)
  const [confirmingAction, setConfirmingAction] = useState(false)
  const [rejectingItemId, setRejectingItemId] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejectingFile, setIsRejectingFile] = useState(false)
  const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active')

  useEffect(() => {
    void loadItems()
  }, [viewMode])

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 2500)
    return () => clearTimeout(timer)
  }, [success])

  const orderedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0) || String(a.category || '').localeCompare(String(b.category || '')) || String(a.title || '').localeCompare(String(b.title || '')) || String(a.language || '').localeCompare(String(b.language || ''))),
    [items]
  )

  const groupedItems = useMemo(() => {
    const categoryMap = new Map<string, Map<string, DownloadItemDto[]>>()
    orderedItems.forEach((item) => {
      const category = item.category?.trim() || 'Uncategorized'
      const title = item.title?.trim() || 'Untitled'
      const titleMap = categoryMap.get(category) || new Map<string, DownloadItemDto[]>()
      const list = titleMap.get(title) || []
      list.push(item)
      titleMap.set(title, list)
      categoryMap.set(category, titleMap)
    })

    return Array.from(categoryMap.entries()).map(([category, titleMap]) => ({
      category,
      titles: Array.from(titleMap.entries()).map(([title, titleItems]) => ({
        title,
        items: [...titleItems].sort((a, b) => String(a.language || '').localeCompare(String(b.language || ''))),
      })),
    }))
  }, [orderedItems])

  const resetForm = () => {
    setForm(createInitialFormState())
    setEditingId('')
  }

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = viewMode === 'deleted' ? await fetchDeletedDownloads() : await fetchAdminDownloads()
      setItems(data || [])
      setError('')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load downloads.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof DownloadFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingFile(true)
      setError('')
      const fileUrl = await uploadDownloadFile(file)
      setForm((prev) => ({ ...prev, fileUrl }))
      setSuccess('PDF uploaded successfully.')
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'PDF upload failed.')
    } finally {
      setUploadingFile(false)
      event.target.value = ''
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!canCreate && !editingId) {
      setError('You do not have permission to add downloads.')
      return
    }

    if (!canEdit && editingId) {
      setError('You do not have permission to edit downloads.')
      return
    }

    if (!form.category.trim() || !form.title.trim() || !form.language.trim() || !form.fileUrl.trim()) {
      setError('Category, title, language, and PDF file are required.')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        category: form.category.trim(),
        title: form.title.trim(),
        language: form.language.trim(),
        fileUrl: form.fileUrl.trim(),
        activeStatus: form.activeStatus,
      }

      if (editingId) {
        await updateDownloadItem(editingId, payload)
        setSuccess('Download updated successfully.')
      } else {
        await createDownloadItem(payload)
        setSuccess('Download added successfully.')
      }

      resetForm()
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to save download.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: DownloadItemDto) => {
    const id = getDownloadId(item)
    if (!id) return

    setEditingId(id)
    setForm({
      category: item.category || '',
      title: item.title || '',
      language: item.language || '',
      fileUrl: item.fileUrl || '',
      activeStatus: item.activeStatus ?? true,
    })
  }

  const handleDelete = (itemId: string) => {
    setConfirmState({
      title: 'Delete Download',
      description: 'Delete this download entry? It will be moved to the Trash.',
      confirmLabel: 'Delete',
      intent: 'danger',
      onConfirm: async () => {
        try {
          await deleteDownloadItem(itemId)
          setSuccess('Download deleted successfully.')
          await loadItems()
        } catch (err: any) {
          setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete download.')
        }
      },
    })
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreDownloadItem(id)
      setSuccess('Download restored successfully.')
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to restore download.')
    }
  }

  const handlePermanentDelete = (itemId: string) => {
    setConfirmState({
      title: 'Permanently Delete Download',
      description: 'Are you sure you want to permanently delete this file? This cannot be undone and will remove the PDF from the server.',
      confirmLabel: 'Delete Permanently',
      intent: 'danger',
      onConfirm: async () => {
        try {
          await permanentlyDeleteDownloadItem(itemId)
          setSuccess('Download permanently deleted.')
          await loadItems()
        } catch (err: any) {
          setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to permanently delete download.')
        }
      },
    })
  }

  const handleApprove = (itemId: string) => {
    setConfirmState({
      title: 'Approve Download',
      description: 'Approve this download item to make it visible in the public download centre?',
      confirmLabel: 'Approve',
      intent: 'success',
      onConfirm: async () => {
        try {
          await approveDownloadItem(itemId)
          setSuccess('Download approved successfully.')
          await loadItems()
        } catch (err: any) {
          setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to approve download.')
        }
      },
    })
  }

  const handleRejectClick = (itemId: string) => {
    setRejectingItemId(itemId)
    setRejectionReason('')
  }

  const handleRejectSubmit = async () => {
    if (!rejectingItemId) return

    try {
      setIsRejectingFile(true)
      await rejectDownloadItem(rejectingItemId, rejectionReason)
      setSuccess('Download rejected successfully.')
      setRejectingItemId('')
      setRejectionReason('')
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to reject download.')
    } finally {
      setIsRejectingFile(false)
    }
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

  const inputClassName = (hasError = false) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
      hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary/20'
    }`

  // Extract unique categories and titles for autocomplete
  const allCategories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category?.trim()).filter(Boolean))).sort(),
    [items]
  )

  const titlesForCategory = useMemo(
    () => Array.from(new Set(items.filter((item) => item.category?.trim() === form.category).map((item) => item.title?.trim()).filter(Boolean))).sort(),
    [items, form.category]
  )

  const languagesForTitle = useMemo(
    () => items.filter((item) => item.category?.trim() === form.category && item.title?.trim() === form.title).map((item) => item.language?.trim()).filter(Boolean),
    [items, form.category, form.title]
  )

  const missingLanguages = useMemo(
    () =>
      DOWNLOAD_LANGUAGE_OPTIONS.filter(
        (lang) => !languagesForTitle.some((existingLanguage) => existingLanguage.trim().toLowerCase() === lang.toLowerCase())
      ),
    [languagesForTitle]
  )

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Downloads Management"
        subtitle="Add category-based PDFs by title and language, then publish them in the download centre."
        icon={Download}
        actions={
          <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1">
            <ActionButton
              label="Active"
              onClick={() => setViewMode('active')}
              variant={viewMode === 'active' ? 'primary' : 'view'}
              size="sm"
              className={viewMode === 'active' ? 'shadow-sm' : 'border-transparent bg-transparent hover:bg-gray-50'}
            />
            <ActionButton
              label="Trash"
              onClick={() => setViewMode('deleted')}
              variant={viewMode === 'deleted' ? 'delete' : 'view'}
              size="sm"
              className={viewMode === 'deleted' ? 'shadow-sm' : 'border-transparent bg-transparent hover:bg-gray-50 text-gray-500'}
            />
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className={`rounded-2xl border border-border bg-white shadow-sm transition-opacity duration-300 ${viewMode === 'deleted' ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4">
            <h2 className="text-lg font-bold text-secondary">{editingId ? 'Edit Download' : 'Add Download'}</h2>
            <p className="mt-1 text-xs text-gray-600">Add multiple language PDFs for the same title by selecting existing category and title, then adding another language.</p>
          </div>

          <form className="space-y-4 p-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">Category *</label>
              <input
                list="categories-list"
                value={form.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className={inputClassName()}
                placeholder="Enter category"
              />
              <datalist id="categories-list">
                {allCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">Title *</label>
              <input
                list={form.category ? 'titles-list' : undefined}
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className={inputClassName()}
                placeholder="Enter title"
                disabled={!form.category}
              />
              {form.category && (
                <datalist id="titles-list">
                  {titlesForCategory.map((title) => (
                    <option key={title} value={title} />
                  ))}
                </datalist>
              )}
              {form.category && (
                <p className="mt-1 text-xs text-gray-500">
                  {form.category}: {titlesForCategory.length} title{titlesForCategory.length === 1 ? '' : 's'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">Language *</label>
              <select
                value={form.language}
                onChange={(event) => handleChange('language', event.target.value)}
                className={inputClassName()}
              >
                <option value="">Select a language</option>
                {missingLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
                {languagesForTitle.map((lang) => (
                  <option key={lang} value={lang} disabled>
                    {lang} (already added)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Use Document for files that do not belong to a specific language.</p>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary">
                <FileText className="h-4 w-4 text-primary" />
                PDF File
              </div>
              {form.fileUrl ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-emerald-800 truncate">{getFileName(form.fileUrl)}</p>
                      <a className="text-xs text-emerald-700 hover:underline" href={resolveMediaUrl(form.fileUrl)} target="_blank" rel="noreferrer">
                        Open current PDF
                      </a>
                    </div>
                    <button type="button" onClick={() => handleChange('fileUrl', '')} className="text-emerald-700 hover:text-emerald-900">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-border bg-white px-4 py-6 text-center hover:border-primary/40 hover:bg-primary/[0.03]">
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="mt-2 text-sm font-semibold text-secondary">Click to upload PDF</span>
                  <span className="mt-1 text-xs text-gray-500">Only .pdf files are accepted, max 15 MB</span>
                  <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
              {uploadingFile && <p className="mt-3 text-xs text-primary">Uploading PDF...</p>}
            </div>

            <ToggleSwitch
              checked={form.activeStatus}
              onChange={(checked) => handleChange('activeStatus', checked)}
              label="Active"
            />

            <div className="flex gap-2">
              <ActionButton
                label={submitting ? 'Saving...' : editingId ? 'Update Download' : 'Add Download'}
                onClick={() => {}}
                type="submit"
                disabled={submitting || uploadingFile}
                icon={submitting ? Loader2 : Save}
                variant="primary"
                className={submitting ? '[&>svg]:animate-spin' : 'flex-1'}
              />
              {editingId && (
                <ActionButton
                  label="Cancel"
                  onClick={() => resetForm()}
                  variant="neutral"
                  className="flex-1"
                />
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4">
            <h2 className="text-lg font-bold text-secondary">{viewMode === 'deleted' ? 'Deleted Downloads' : 'Published Downloads'}</h2>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : groupedItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface-muted py-16 text-center text-gray-500">
                <FileText className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="font-medium">No download items yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedItems.map((group) => (
                  <section key={group.category} className="space-y-3">
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
                      <div>
                        <h3 className="text-lg font-bold text-secondary">{group.category}</h3>
                        <p className="text-xs text-gray-500">{group.titles.length} title{group.titles.length === 1 ? '' : 's'}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        Category
                      </span>
                    </div>

                    <div className="space-y-4 pl-3">
                      {group.titles.map((titleGroup) => (
                        <div key={`${group.category}-${titleGroup.title}`} className="space-y-2">
                          <div>
                            <h4 className="text-base font-bold text-secondary">{titleGroup.title}</h4>
                            <p className="text-xs text-gray-500">{titleGroup.items.length} language{titleGroup.items.length === 1 ? '' : 's'}</p>
                          </div>

                          <div className="space-y-2">
                            {titleGroup.items.map((item, index) => {
                              const id = getDownloadId(item)
                              return (
                                <div
                                  key={id || `${group.category}-${titleGroup.title}-${item.language}-${index}`}
                                  className="rounded-xl border border-border bg-white p-3 transition hover:border-primary/20 hover:shadow-sm"
                                >
                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                                          {item.language}
                                        </span>
                                        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${item.activeStatus === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                          {item.activeStatus === false ? 'Inactive' : 'Active'}
                                        </span>
                                        {item.approved ? (
                                          <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Approved
                                          </span>
                                        ) : item.rejected ? (
                                          <span className="rounded-lg bg-red-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700 flex items-center gap-1">
                                            <XCircle className="h-3 w-3" />
                                            Rejected
                                          </span>
                                        ) : (
                                          <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                                            Pending
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto lg:justify-end">
                                      <a
                                        href={resolveMediaUrl(item.fileUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary/15 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                        Open PDF
                                      </a>
                                      {viewMode === 'deleted' ? (
                                        <>
                                          {canDelete && (
                                            <>
                                              <ActionButton
                                                label="Restore"
                                                onClick={() => id && handleRestore(id)}
                                                icon={CheckCircle}
                                                variant="primary"
                                                size="xs"
                                                className="shrink-0 whitespace-nowrap"
                                              />
                                              <ActionButton
                                                label="Delete Permanently"
                                                onClick={() => id && handlePermanentDelete(id)}
                                                icon={Trash2}
                                                variant="delete"
                                                size="xs"
                                                className="shrink-0 whitespace-nowrap"
                                              />
                                            </>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          {canEdit && (
                                            <ActionButton
                                              label="Edit"
                                              onClick={() => handleEdit(item)}
                                              icon={Pencil}
                                              variant="edit"
                                              size="xs"
                                              className="shrink-0 whitespace-nowrap"
                                            />
                                          )}
                                          {canApprove && !item.approved && !item.rejected && (
                                            <>
                                              <ActionButton
                                                label="Approve"
                                                onClick={() => id && handleApprove(id)}
                                                icon={CheckCircle}
                                                variant="primary"
                                                size="xs"
                                                className="shrink-0 whitespace-nowrap"
                                              />
                                              <ActionButton
                                                label="Reject"
                                                onClick={() => id && handleRejectClick(id)}
                                                icon={XCircle}
                                                variant="delete"
                                                size="xs"
                                                className="shrink-0 whitespace-nowrap"
                                              />
                                            </>
                                          )}
                                          {canDelete && (
                                            <ActionButton
                                              label="Delete"
                                              onClick={() => id && handleDelete(id)}
                                              icon={Trash2}
                                              variant="delete"
                                              size="xs"
                                              className="shrink-0 whitespace-nowrap"
                                            />
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmState && (
        <ConfirmDialog
          isOpen={!!confirmState}
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          intent={confirmState.intent}
          onConfirm={() => void handleConfirmDialog()}
          onCancel={closeConfirmDialog}
          isConfirming={confirmingAction}
        />
      )}

      {rejectingItemId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setRejectingItemId('')} />
          <div className="relative rounded-2xl bg-white p-6 max-w-md w-full shadow-2xl">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-secondary">Reject Download</h3>
              <p className="text-sm text-gray-600 mt-1">Provide a reason for rejection</p>
            </div>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={4}
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRejectingItemId('')}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 font-semibold text-secondary hover:bg-gray-50 transition"
                disabled={isRejectingFile}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleRejectSubmit()}
                disabled={isRejectingFile}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isRejectingFile ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}