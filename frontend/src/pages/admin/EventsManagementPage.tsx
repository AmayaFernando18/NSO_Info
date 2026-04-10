import { useEffect, useMemo, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Loader2,
  X,
  Check,
  XCircle,
  Trash2,
  Pencil,
  Save,
  Plus,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import {
  createEvent,
  fetchAdminEvents,
  fetchDeletedEvents,
  approveEvent,
  rejectEvent,
  removeEvent,
  updateEvent,
  restoreEvent,
  permanentlyDeleteEvent,
} from '../../services/eventsService'
import type { EventDto, EventCategory } from '../../types'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { hasFieldErrors, parseApiValidationErrors, validateEventForm } from '../../utils/adminValidation'

type EventFormState = {
  title: string
  description: string
  category: EventCategory
  eventDate: string
  endDate: string
  linkLabel: string
  linkUrl: string
  isHoliday: boolean
  isSpecialDay: boolean
  activeStatus: boolean
}

const EVENT_CATEGORIES: EventCategory[] = [
  'Meeting',
  'Training',
  'Workshop',
  'Conference',
  'Holiday',
  'Special Day',
  'Coordination',
  'Drill',
  'Other',
]

const getCurrentDateForInput = () => {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

const createInitialFormState = (): EventFormState => ({
  title: '',
  description: '',
  category: 'Other',
  eventDate: getCurrentDateForInput(),
  endDate: '',
  linkLabel: '',
  linkUrl: '',
  isHoliday: false,
  isSpecialDay: false,
  activeStatus: true,
})

const getCategoryBadgeColor = (category: EventCategory) => {
  const colors: Record<EventCategory, string> = {
    Meeting: 'bg-blue-100 text-blue-800',
    Training: 'bg-purple-100 text-purple-800',
    Workshop: 'bg-indigo-100 text-indigo-800',
    Conference: 'bg-cyan-100 text-cyan-800',
    Holiday: 'bg-red-100 text-red-800',
    'Special Day': 'bg-amber-100 text-amber-800',
    Coordination: 'bg-teal-100 text-teal-800',
    Drill: 'bg-orange-100 text-orange-800',
    Other: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || colors.Other
}

export default function EventsManagementPage() {
  const { user } = useUser()

  const canCreate = canPerformAction(user, RBAC_FUNCTION.EVENTS, 'create')
  const canEdit = canPerformAction(user, RBAC_FUNCTION.EVENTS, 'edit')
  const canDelete = canPerformAction(user, RBAC_FUNCTION.EVENTS, 'delete')
  const canApprove = canPerformAction(user, RBAC_FUNCTION.EVENTS, 'approve')

  const [form, setForm] = useState<EventFormState>(createInitialFormState)
  const [events, setEvents] = useState<EventDto[]>([])
  const [deletedEvents, setDeletedEvents] = useState<EventDto[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [showDeleted, setShowDeleted] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EventFormState, string>>>({})

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EventDto | null>(null)
  const [editForm, setEditForm] = useState<EventFormState>(createInitialFormState)
  const [editError, setEditError] = useState('')
  const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<keyof EventFormState, string>>>({})
  const [confirmingAction, setConfirmingAction] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description: string
    confirmLabel: string
    intent: 'primary' | 'success' | 'warning' | 'danger'
    onConfirm: () => Promise<void>
  } | null>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(timer)
  }, [success])

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    [events]
  )

  const loadEvents = async () => {
    try {
      setLoadingEvents(true)
      const data = await fetchAdminEvents()
      setEvents(data)
    } catch (err) {
      setError('Failed to load events.')
    } finally {
      setLoadingEvents(false)
    }
  }

  const loadDeletedEvents = async () => {
    try {
      const data = await fetchDeletedEvents()
      setDeletedEvents(data)
    } catch (err) {
      console.error('Failed to load deleted events:', err)
    }
  }

  useEffect(() => {
    loadEvents()
    loadDeletedEvents()
  }, [])

  const handleChange = (field: keyof EventFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const resetForm = () => {
    setForm(createInitialFormState())
    setFieldErrors({})
  }

  const inputClassName = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-primary ${
      hasError ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/20'
    }`

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    if (!canCreate) {
      setError('You do not have permission to create events.')
      return
    }

    const validationErrors = validateEventForm(form)
    if (hasFieldErrors(validationErrors)) {
      setFieldErrors(validationErrors as Partial<Record<keyof EventFormState, string>>)
      setError('Please correct the highlighted fields and try again.')
      return
    }

    try {
      setSubmitting(true)
      const created = await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        eventDate: form.eventDate,
        endDate: form.endDate || null,
        linkLabel: form.linkLabel.trim() || undefined,
        linkUrl: form.linkUrl.trim() || undefined,
        isHoliday: form.isHoliday,
        isSpecialDay: form.isSpecialDay,
        activeStatus: form.activeStatus,
      })

      setEvents((prev) => [created, ...prev])
      setSuccess('Event created successfully. It is pending approval.')
      resetForm()
      setShowCreateForm(false)
    } catch (err: any) {
      const parsed = parseApiValidationErrors(err)
      setFieldErrors(parsed.fieldErrors as Partial<Record<keyof EventFormState, string>>)
      setError(parsed.message || 'Failed to create event.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    if (!canApprove) {
      setError('You do not have permission to approve events.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [itemId]: true }))
      setError('')
      const approved = await approveEvent(itemId)
      setEvents((prev) => prev.map((item) => ((item.id || item._id) === itemId ? approved : item)))
      setSuccess('Event approved successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to approve event.'
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
      const rejected = await rejectEvent(rejectingItemId, rejectionReason.trim())
      setEvents((prev) =>
        prev.map((item) => ((item.id || item._id) === rejectingItemId ? rejected : item))
      )
      setSuccess('Event rejected successfully.')
      setRejectModalOpen(false)
      setRejectingItemId(null)
      setRejectionReason('')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to reject event.'
      setError(message)
    } finally {
      if (rejectingItemId) {
        setActionLoading((prev) => ({ ...prev, [rejectingItemId]: false }))
      }
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete events.')
      return
    }

    setConfirmState({
      title: 'Delete Event',
      description: 'Move this event to Deleted items? You can restore it later.',
      confirmLabel: 'Delete',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading((prev) => ({ ...prev, [itemId]: true }))
          setError('')
          await removeEvent(itemId)
          const deletedItem = events.find((e) => (e.id || e._id) === itemId)
          setEvents((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
          if (deletedItem) {
            setDeletedEvents((prev) => [{ ...deletedItem, isDeleted: true }, ...prev])
          }
          setSuccess('Event moved to deleted items.')
        } catch (err: any) {
          const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete event.'
          setError(message)
        } finally {
          setActionLoading((prev) => ({ ...prev, [itemId]: false }))
        }
      },
    })
  }

  const handleRestore = async (itemId: string) => {
    if (!canDelete) {
      setError('You do not have permission to restore events.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [itemId]: true }))
      setError('')
      const restored = await restoreEvent(itemId)
      setDeletedEvents((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
      setEvents((prev) => [restored, ...prev])
      setSuccess('Event restored successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to restore event.'
      setError(message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const handlePermanentDelete = async (itemId: string) => {
    if (!canDelete) {
      setError('You do not have permission to permanently delete events.')
      return
    }

    setConfirmState({
      title: 'Permanently Delete Event',
      description: 'Are you sure you want to permanently delete this event? This action cannot be undone.',
      confirmLabel: 'Delete Permanently',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading((prev) => ({ ...prev, [itemId]: true }))
          setError('')
          await permanentlyDeleteEvent(itemId)
          setDeletedEvents((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
          setSuccess('Event permanently deleted.')
        } catch (err: any) {
          const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to permanently delete event.'
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

  const handleEditClick = (item: EventDto) => {
    setEditError('')
    setEditingItem(item)
    setEditForm({
      title: item.title,
      description: item.description,
      category: item.category,
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      linkLabel: item.linkLabel || '',
      linkUrl: item.linkUrl || '',
      isHoliday: item.isHoliday || false,
      isSpecialDay: item.isSpecialDay || false,
      activeStatus: item.activeStatus !== false,
    })
    setEditModalOpen(true)
  }

  const handleEditChange = (field: keyof EventFormState, value: string | boolean) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
    setEditFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !canEdit) return

    const itemId = editingItem.id || editingItem._id
    if (!itemId) return

    setEditFieldErrors({})
    const validationErrors = validateEventForm(editForm)
    if (hasFieldErrors(validationErrors)) {
      setEditFieldErrors(validationErrors as Partial<Record<keyof EventFormState, string>>)
      setEditError('Please correct the highlighted fields before saving.')
      return
    }

    try {
      setEditError('')
      setActionLoading((prev) => ({ ...prev, [itemId]: true }))
      const updated = await updateEvent(itemId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        eventDate: editForm.eventDate,
        endDate: editForm.endDate || null,
        linkLabel: editForm.linkLabel.trim() || undefined,
        linkUrl: editForm.linkUrl.trim() || undefined,
        isHoliday: editForm.isHoliday,
        isSpecialDay: editForm.isSpecialDay,
        activeStatus: editForm.activeStatus,
      })
      setEvents((prev) => prev.map((item) => ((item.id || item._id) === itemId ? updated : item)))
      setSuccess('Event updated successfully. Re-approval may be required.')
      setEditModalOpen(false)
      setEditingItem(null)
    } catch (err: any) {
      const parsed = parseApiValidationErrors(err)
      setEditFieldErrors(parsed.fieldErrors as Partial<Record<keyof EventFormState, string>>)
      setEditError(parsed.message || 'Failed to update event.')
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const displayList = showDeleted ? deletedEvents : sortedEvents

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events Management"
        subtitle="Create and manage events for the calendar"
        icon={Calendar}
        actions={
          <>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showDeleted
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showDeleted ? 'View Active' : `Deleted (${deletedEvents.length})`}
            </button>
            {canCreate && !showDeleted && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </button>
            )}
          </>
        }
      />

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Create Event Form */}
      {showCreateForm && canCreate && !showDeleted && (
        <div className="bg-white border border-border rounded-xl shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-secondary">Create New Event</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={inputClassName(Boolean(fieldErrors.title))}
                  placeholder="Event title"
                />
                {fieldErrors.title ? <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value as EventCategory)}
                  className={inputClassName(Boolean(fieldErrors.category))}
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {fieldErrors.category ? <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p> : null}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className={inputClassName(Boolean(fieldErrors.description))}
                placeholder="Event description"
              />
              {fieldErrors.description ? <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p> : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  className={inputClassName(Boolean(fieldErrors.eventDate))}
                />
                {fieldErrors.eventDate ? <p className="mt-1 text-xs text-red-600">{fieldErrors.eventDate}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={inputClassName(Boolean(fieldErrors.endDate))}
                />
                {fieldErrors.endDate ? <p className="mt-1 text-xs text-red-600">{fieldErrors.endDate}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Label</label>
                <input
                  type="text"
                  value={form.linkLabel}
                  onChange={(e) => handleChange('linkLabel', e.target.value)}
                  className={inputClassName(Boolean(fieldErrors.linkLabel))}
                  placeholder="e.g., Register Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) => handleChange('linkUrl', e.target.value)}
                  className={inputClassName(Boolean(fieldErrors.linkUrl))}
                  placeholder="https://example.com"
                />
                {fieldErrors.linkUrl ? <p className="mt-1 text-xs text-red-600">{fieldErrors.linkUrl}</p> : null}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isHoliday}
                  onChange={(e) => handleChange('isHoliday', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Holiday</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSpecialDay}
                  onChange={(e) => handleChange('isSpecialDay', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Special Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activeStatus}
                  onChange={(e) => handleChange('activeStatus', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowCreateForm(false)
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white border border-border rounded-xl shadow-sm">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-secondary">
            {showDeleted ? 'Deleted Events' : 'All Events'} ({displayList.length})
          </h2>
        </div>

        {loadingEvents ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{showDeleted ? 'No deleted events.' : 'No events found.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayList.map((item) => {
              const itemId = item.id || item._id || ''
              const isLoading = actionLoading[itemId]

              return (
                <div key={itemId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-secondary truncate">{item.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryBadgeColor(item.category)}`}>
                          {item.category}
                        </span>
                        {item.isHoliday && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Holiday
                          </span>
                        )}
                        {item.isSpecialDay && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                            Special Day
                          </span>
                        )}
                        {item.approved ? (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : item.rejected ? (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Date: {new Date(item.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        {item.endDate && (
                          <span>
                            - {new Date(item.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {item.linkLabel && item.linkUrl && (
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {item.linkLabel}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {item.rejected && item.rejectionReason && (
                        <p className="text-xs text-red-600 mt-2">
                          Rejection reason: {item.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {showDeleted ? (
                        <>
                          {canDelete && (
                            <>
                              <button
                                onClick={() => handleRestore(itemId)}
                                disabled={isLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Restore"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(itemId)}
                                disabled={isLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Permanently Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {canApprove && !item.approved && !item.rejected && (
                            <>
                              <button
                                onClick={() => handleApprove(itemId)}
                                disabled={isLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectClick(itemId)}
                                disabled={isLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => handleEditClick(item)}
                              disabled={isLoading}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(itemId)}
                              disabled={isLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-secondary mb-4">Reject Event</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModalOpen(false)
                  setRejectingItemId(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
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

      {/* Edit Modal */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full shadow-xl max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-secondary">Edit Event</h3>
              <button
                onClick={() => {
                  setEditModalOpen(false)
                  setEditingItem(null)
                  setEditError('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm flex-1">{editError}</p>
                  <button onClick={() => setEditError('')} className="text-red-600 hover:text-red-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <form onSubmit={handleEditSubmit} className="space-y-4" id="edit-event-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                      className={inputClassName(Boolean(editFieldErrors.title))}
                    />
                    {editFieldErrors.title ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.title}</p> : null}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => handleEditChange('category', e.target.value as EventCategory)}
                      className={inputClassName(Boolean(editFieldErrors.category))}
                    >
                      {EVENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {editFieldErrors.category ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.category}</p> : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    rows={3}
                    className={inputClassName(Boolean(editFieldErrors.description))}
                  />
                  {editFieldErrors.description ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.description}</p> : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                    <input
                      type="date"
                      value={editForm.eventDate}
                      onChange={(e) => handleEditChange('eventDate', e.target.value)}
                      className={inputClassName(Boolean(editFieldErrors.eventDate))}
                    />
                    {editFieldErrors.eventDate ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.eventDate}</p> : null}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => handleEditChange('endDate', e.target.value)}
                      className={inputClassName(Boolean(editFieldErrors.endDate))}
                    />
                    {editFieldErrors.endDate ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.endDate}</p> : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Label</label>
                    <input
                      type="text"
                      value={editForm.linkLabel}
                      onChange={(e) => handleEditChange('linkLabel', e.target.value)}
                      className={inputClassName(Boolean(editFieldErrors.linkLabel))}
                      placeholder="e.g., Register Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                    <input
                      type="url"
                      value={editForm.linkUrl}
                      onChange={(e) => handleEditChange('linkUrl', e.target.value)}
                      className={inputClassName(Boolean(editFieldErrors.linkUrl))}
                      placeholder="https://example.com"
                    />
                    {editFieldErrors.linkUrl ? <p className="mt-1 text-xs text-red-600">{editFieldErrors.linkUrl}</p> : null}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isHoliday}
                      onChange={(e) => handleEditChange('isHoliday', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Holiday</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isSpecialDay}
                      onChange={(e) => handleEditChange('isSpecialDay', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Special Day</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.activeStatus}
                      onChange={(e) => handleEditChange('activeStatus', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false)
                  setEditingItem(null)
                  setEditError('')
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-event-form"
                disabled={actionLoading[editingItem.id || editingItem._id || '']}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {actionLoading[editingItem.id || editingItem._id || ''] ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
