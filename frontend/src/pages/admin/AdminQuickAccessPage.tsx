import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Save,
  Trash2,
  X,
} from 'lucide-react'

import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { useUser } from '../../context/UserContext'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import {
  approveQuickAccess,
  createQuickAccess,
  deleteQuickAccess,
  fetchAdminQuickAccess,
  fetchDeletedQuickAccess,
  permanentlyDeleteQuickAccess,
  rejectQuickAccess,
  reorderQuickAccess,
  restoreQuickAccess,
  updateQuickAccess,
  type QuickAccessInput,
} from '../../services/quickAccessService'
import type { QuickAccessDto } from '../../types'
import { getQuickAccessIconOptions, resolveQuickAccessIcon } from '../../utils/quickAccessIcons'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialForm: QuickAccessInput = {
  title: '',
  description: '',
  url: '',
  icon: 'Link2',
  order: 1,
  activeStatus: true,
}

type ViewMode = 'active' | 'deleted'

type IconPickerProps = {
  value: string
  search: string
  disabled: boolean
  onSearchChange: (value: string) => void
  onSelect: (iconName: string) => void
}

function IconPicker({ value, search, disabled, onSearchChange, onSelect }: IconPickerProps) {
  const iconOptions = useMemo(() => getQuickAccessIconOptions(search), [search])
  const SelectedIcon = resolveQuickAccessIcon(value) || Link2

  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface-muted p-3">
      <p className="text-sm font-medium text-secondary">Icon (Lucide)</p>
      <div className="flex items-center gap-2 rounded-md border border-border bg-elevated px-2 py-1.5">
        <Search className="h-4 w-4 text-content-muted" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Search related icons (mail, user, file, etc.)"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="grid max-h-48 grid-cols-2 gap-2 overflow-auto rounded-lg border border-border bg-elevated p-2 sm:grid-cols-3">
        {iconOptions.map((iconName) => {
          const Icon = resolveQuickAccessIcon(iconName)
          if (!Icon) return null

          const isSelected = value === iconName

          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              className={`rounded-md border px-2.5 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-secondary hover:bg-surface-muted'
              }`}
              disabled={disabled}
            >
              <div className="mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded bg-surface-muted">
                <Icon className="h-5 w-5" />
              </div>
              <div className="truncate">{iconName}</div>
            </button>
          )
        })}
        {iconOptions.length === 0 && (
          <p className="col-span-full text-xs text-content-muted">No matching icons found. Try another keyword.</p>
        )}
      </div>
      <div className="inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-2.5 py-2 text-sm text-secondary">
        <SelectedIcon className="h-5 w-5" />
        <span>{value}</span>
      </div>
    </div>
  )
}

export default function AdminQuickAccessPage() {
  const { user } = useUser()
  const canCreate = canPerformAction(user, RBAC_FUNCTION.QUICK_ACCESS, 'create')
  const canEdit = canPerformAction(user, RBAC_FUNCTION.QUICK_ACCESS, 'edit')
  const canDelete = canPerformAction(user, RBAC_FUNCTION.QUICK_ACCESS, 'delete')
  const canApprove = canPerformAction(user, RBAC_FUNCTION.QUICK_ACCESS, 'approve')

  const [items, setItems] = useState<QuickAccessDto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savingRowId, setSavingRowId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('active')

  const [form, setForm] = useState<QuickAccessInput>(initialForm)
  const [createIconSearch, setCreateIconSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<QuickAccessInput>(initialForm)
  const [editIconSearch, setEditIconSearch] = useState('')

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [confirmingAction, setConfirmingAction] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description: string
    confirmLabel: string
    intent: 'primary' | 'success' | 'warning' | 'danger'
    onConfirm: () => Promise<void>
  } | null>(null)

  useEffect(() => {
    void loadItems()
  }, [viewMode])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(''), 2500)
    return () => clearTimeout(t)
  }, [success])

  const orderedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [items]
  )
  const loadItems = async () => {
    try {
      setLoading(true)
      const data = viewMode === 'deleted' ? await fetchDeletedQuickAccess() : await fetchAdminQuickAccess()
      setItems(data || [])
      setError('')
    } catch (err: any) {
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message
      if (apiMessage) {
        setError(`Failed to load quick access items: ${apiMessage}`)
      } else {
        setError('Failed to load quick access items. Check backend server and permissions.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ ...initialForm, order: orderedItems.length + 1 })
    setCreateIconSearch('')
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!canCreate) {
      setError('You do not have permission to add quick access items.')
      return
    }

    if (!form.title.trim() || !form.description.trim() || !form.url.trim() || !form.icon.trim()) {
      setError('Title, description, URL, and icon are required.')
      return
    }

    try {
      setSubmitting(true)
      await createQuickAccess({
        title: form.title.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
        icon: form.icon.trim(),
        order: orderedItems.length + 1,
        activeStatus: form.activeStatus,
      })
      resetForm()
      setSuccess('Quick access item added. Approve it to publish.')
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to add quick access item.')
    } finally {
      setSubmitting(false)
    }
  }

  const beginEdit = (item: QuickAccessDto) => {
    const id = item.id || item._id
    if (!id) return
    setEditingId(id)
    setEditDraft({
      title: item.title || '',
      description: item.description || '',
      url: item.url || '',
      icon: item.icon || 'Link2',
      order: item.order || 1,
      activeStatus: item.activeStatus ?? true,
    })
    setEditIconSearch(item.icon || 'Link2')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft(initialForm)
    setEditIconSearch('')
  }

  const saveEdit = async (id: string) => {
    setError('')

    if (!canEdit) {
      setError('You do not have permission to edit quick access items.')
      return
    }

    if (!editDraft.title.trim() || !editDraft.description.trim() || !editDraft.url.trim() || !editDraft.icon.trim()) {
      setError('Title, description, URL, and icon are required.')
      return
    }

    try {
      setSavingRowId(id)
      await updateQuickAccess(id, {
        title: editDraft.title.trim(),
        description: editDraft.description.trim(),
        url: editDraft.url.trim(),
        icon: editDraft.icon.trim(),
        activeStatus: editDraft.activeStatus,
      })
      setSuccess('Quick access item updated. Re-approve to publish changes.')
      cancelEdit()
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update quick access item.')
    } finally {
      setSavingRowId(null)
    }
  }

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (!canEdit) {
      setError('You do not have permission to reorder quick access items.')
      return
    }

    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= orderedItems.length) return

    const next = [...orderedItems]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)

    const orderedIds = next
      .map((link) => link.id || link._id)
      .filter((id): id is string => Boolean(id))

    if (orderedIds.length !== next.length) {
      setError('Cannot reorder due to invalid item id.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const data = await reorderQuickAccess(orderedIds)
      setItems(data)
      setSuccess('Quick access order updated.')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reorder quick access items.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!canApprove) return
    try {
      setSavingRowId(id)
      await approveQuickAccess(id)
      setSuccess('Quick access item approved.')
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to approve quick access item.')
    } finally {
      setSavingRowId(null)
    }
  }

  const openRejectModal = (id: string) => {
    setRejectingId(id)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!rejectingId) return
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.')
      return
    }

    try {
      setSavingRowId(rejectingId)
      await rejectQuickAccess(rejectingId, rejectionReason.trim())
      setSuccess('Quick access item rejected.')
      setRejectModalOpen(false)
      setRejectingId(null)
      setRejectionReason('')
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reject quick access item.')
    } finally {
      setSavingRowId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete quick access items.')
      return
    }

    setConfirmState({
      title: 'Delete Quick Access Item',
      description: 'Delete this quick access item? It can be restored from the Deleted tab later.',
      confirmLabel: 'Delete',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setSavingRowId(id)
          await deleteQuickAccess(id)
          setSuccess('Quick access item deleted.')
          await loadItems()
        } catch (err: any) {
          setError(err?.response?.data?.error || 'Failed to delete quick access item.')
        } finally {
          setSavingRowId(null)
        }
      },
    })
  }

  const handleRestore = async (id: string) => {
    if (!canDelete) return
    try {
      setSavingRowId(id)
      await restoreQuickAccess(id)
      setSuccess('Quick access item restored.')
      await loadItems()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to restore quick access item.')
    } finally {
      setSavingRowId(null)
    }
  }

  const handlePermanentDelete = async (id: string) => {
    if (!canDelete) return

    setConfirmState({
      title: 'Permanently Delete Item',
      description: 'Permanently delete this quick access item? This cannot be undone.',
      confirmLabel: 'Delete Permanently',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setSavingRowId(id)
          await permanentlyDeleteQuickAccess(id)
          setSuccess('Quick access item permanently deleted.')
          await loadItems()
        } catch (err: any) {
          setError(err?.response?.data?.error || 'Failed to permanently delete quick access item.')
        } finally {
          setSavingRowId(null)
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quick Access Management"
        subtitle="Manage shortcut links and approval workflow for the home page"
        icon={Link2}
        actions={
          <button
            onClick={() => void loadItems()}
            disabled={loading}
            className="px-4 py-2.5 border border-border bg-white rounded-lg inline-flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

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

      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Link2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-indigo-900">Quick Access Items</h3>
              <p className="text-xs text-indigo-700">Create, approve, and reorder links displayed on the home page.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                viewMode === 'active'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('deleted')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                viewMode === 'deleted'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              Deleted
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-xl border border-border shadow-sm sticky top-6">
            <div className="p-4 border-b border-border">
              <h3 className="text-base font-semibold text-secondary flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add Quick Access
              </h3>
            </div>

            <div className="p-5">
              {!canCreate && (
                <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  No permission to add items
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={!canCreate || submitting}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="Quick access title"
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
                    placeholder="Short description"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    URL
                  </label>
                  <input
                    value={form.url}
                    onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                    disabled={!canCreate || submitting}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="/dashboard or https://example.com"
                  />
                </div>

                <div>
                  <IconPicker
                    value={form.icon}
                    search={createIconSearch}
                    disabled={!canCreate || submitting}
                    onSearchChange={setCreateIconSearch}
                    onSelect={(iconName) => setForm((prev) => ({ ...prev, icon: iconName }))}
                  />
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
                  disabled={!canCreate || submitting}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Item
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-secondary flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Items ({orderedItems.length})
              </h3>
              {orderedItems.length > 0 && viewMode === 'active' && (
                <span className="text-xs text-gray-500">Top = First shown</span>
              )}
            </div>

            <div className="p-5">
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
                  <p className="mt-3 text-sm text-gray-500">Loading quick access items...</p>
                </div>
              ) : orderedItems.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Link2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No quick access items yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add your first link using the form</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderedItems.map((item, index) => {
                    const id = item.id || item._id || ''
                    const isEditing = editingId === id
                    const isSavingRow = savingRowId === id
                    const Icon = resolveQuickAccessIcon(item.icon) || Link2

                    return (
                      <div
                        key={id || `${item.title}-${index}`}
                        className={`rounded-xl border transition-all ${
                          isEditing ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'
                        }`}
                      >
                        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-semibold">
                              {item.order ?? index + 1}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  item.activeStatus ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {item.activeStatus ? 'Active' : 'Inactive'}
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  item.approved
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : item.rejected
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {item.approved ? 'Approved' : item.rejected ? 'Rejected' : 'Pending'}
                              </span>
                              {viewMode === 'deleted' && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                  Deleted
                                </span>
                              )}
                            </div>
                          </div>

                          {!isEditing && canEdit && viewMode === 'active' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => void moveItem(index, 'up')}
                                disabled={index === 0 || submitting}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <ArrowUp className="h-4 w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => void moveItem(index, 'down')}
                                disabled={index === orderedItems.length - 1 || submitting}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <ArrowDown className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
                                <div className="rounded-lg border border-border bg-gray-50 flex items-center justify-center h-32">
                                  <Icon className="h-10 w-10 text-primary" />
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                      Title
                                    </label>
                                    <input
                                      value={editDraft.title}
                                      onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))}
                                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                      placeholder="Quick access title"
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
                                      placeholder="Short description"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                      URL
                                    </label>
                                    <input
                                      value={editDraft.url}
                                      onChange={(e) => setEditDraft((prev) => ({ ...prev, url: e.target.value }))}
                                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                      placeholder="/dashboard or https://example.com"
                                    />
                                  </div>
                                  <div>
                                    <IconPicker
                                      value={editDraft.icon}
                                      search={editIconSearch}
                                      disabled={isSavingRow}
                                      onSearchChange={setEditIconSearch}
                                      onSelect={(iconName) => setEditDraft((prev) => ({ ...prev, icon: iconName }))}
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
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="w-full sm:w-40 h-28 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-8 w-8 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-semibold text-secondary mb-2">{item.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                <p className="text-xs text-gray-500 break-all">{item.url}</p>

                                {item.rejected && item.rejectionReason && (
                                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                                    <strong>Rejection reason:</strong> {item.rejectionReason}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 sm:items-end">
                                {canEdit && viewMode === 'active' && (
                                  <button
                                    onClick={() => beginEdit(item)}
                                    className="px-3 py-2 border border-border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                                  >
                                    Edit
                                  </button>
                                )}
                                {canApprove && !item.approved && !item.rejected && viewMode === 'active' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => void handleApprove(id)}
                                      disabled={isSavingRow}
                                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(id)}
                                      disabled={isSavingRow}
                                      className="px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-60"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {canDelete && viewMode === 'active' && (
                                  <button
                                    onClick={() => void handleDelete(id)}
                                    disabled={isSavingRow}
                                    className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-60 inline-flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </button>
                                )}
                                {canDelete && viewMode === 'deleted' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => void handleRestore(id)}
                                      disabled={isSavingRow}
                                      className="px-3 py-2 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-50 disabled:opacity-60"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => void handlePermanentDelete(id)}
                                      disabled={isSavingRow}
                                      className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-60"
                                    >
                                      Delete permanently
                                    </button>
                                  </div>
                                )}
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

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setRejectModalOpen(false)}>
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-secondary">Reject Quick Access</h3>
              <p className="text-xs text-gray-500 mt-1">Provide a reason so the creator can update it.</p>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Reason for rejection"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleReject()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
                >
                  Reject
                </button>
              </div>
            </div>
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
