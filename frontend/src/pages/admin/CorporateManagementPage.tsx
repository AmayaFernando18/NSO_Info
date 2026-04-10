import { useEffect, useMemo, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Loader2, Upload, X, Trash2, Pencil, Save, RotateCcw, Phone, Mail, Users } from 'lucide-react'
import {
  createCorporateMember,
  createCorporateCategory,
  fetchAdminCorporateMembers,
  fetchAdminCorporateCategories,
  uploadCorporateImage,
  removeCorporateMember,
  updateCorporateMember,
  updateCorporateCategory,
  restoreCorporateMember,
  permanentlyDeleteCorporateMember,
  fetchDeletedCorporateMembers,
  deleteCorporateCategory,
  reorderCorporateMembers,
} from '../../services/corporateService'
import type { CorporateCategoryDto, CorporateMemberDto } from '../../types'
import { resolveMediaUrl } from '../../utils/media'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ActionButton from '../../components/ui/ActionButton'
import ToggleSwitch from '../../components/ui/ToggleSwitch'
import { hasFieldErrors, parseApiValidationErrors, validateCorporateMemberForm } from '../../utils/adminValidation'

type CorporateFormState = {
  name: string
  position: string
  phone: string
  email: string
  imageUrl: string
  categoryId: string
  activeStatus: boolean
}

type CategoryFormState = {
  name: string
  activeStatus: boolean
  displayOrder: number
}

const createInitialFormState = (): CorporateFormState => ({
  name: '',
  position: '',
  phone: '',
  email: '',
  imageUrl: '',
  categoryId: '',
  activeStatus: true,
})

const createInitialCategoryFormState = (): CategoryFormState => ({
  name: '',
  activeStatus: true,
  displayOrder: 0,
})

const getInitials = (name: string) => {
  const words = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)

  if (words.length === 0) return 'NA'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export default function CorporateManagementPage() {
  const { user } = useUser()

  const canCreate = canPerformAction(user, RBAC_FUNCTION.CORPORATE, 'create')
  const canEdit = canPerformAction(user, RBAC_FUNCTION.CORPORATE, 'edit')
  const canDelete = canPerformAction(user, RBAC_FUNCTION.CORPORATE, 'delete')

  const [form, setForm] = useState<CorporateFormState>(createInitialFormState)
  const [members, setMembers] = useState<CorporateMemberDto[]>([])
  const [deletedMembers, setDeletedMembers] = useState<CorporateMemberDto[]>([])
  const [categories, setCategories] = useState<CorporateCategoryDto[]>([])
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(createInitialCategoryFormState)
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [categoryEditingId, setCategoryEditingId] = useState('')
  const [categoryEditForm, setCategoryEditForm] = useState<CategoryFormState>(createInitialCategoryFormState)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [showDeletedTab, setShowDeletedTab] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CorporateFormState, string>>>({})
  const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<keyof CorporateFormState, string>>>({})

  // Edit panel state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CorporateMemberDto | null>(null)
  const [editForm, setEditForm] = useState<CorporateFormState>(createInitialFormState)
  const [editUploading, setEditUploading] = useState(false)
  const [closingPanel, setClosingPanel] = useState(false)
  const [confirmingAction, setConfirmingAction] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description: string
    confirmLabel: string
    intent: 'primary' | 'success' | 'warning' | 'danger'
    onConfirm: () => Promise<void>
  } | null>(null)

  // Auto-dismiss success
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(timer)
  }, [success])

  const closeEditPanel = () => {
    setClosingPanel(true)
    setTimeout(() => {
      setEditModalOpen(false)
      setEditingItem(null)
      setClosingPanel(false)
      setEditFieldErrors({})
    }, 250)
  }

  const loadMembers = async () => {
    try {
      setLoading(true)
      const [active, deleted, categoryData] = await Promise.all([
        fetchAdminCorporateMembers(),
        fetchDeletedCorporateMembers(),
        fetchAdminCorporateCategories(),
      ])
      setMembers(active)
      setDeletedMembers(deleted)
      setCategories(categoryData)
    } catch (err) {
      setError('Failed to load corporate members.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const orderedMembers = useMemo(
    () => [...members].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [members]
  )

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [categories]
  )

  const selectableCategories = useMemo(
    () => orderedCategories.filter((category) => category.activeStatus !== false),
    [orderedCategories]
  )

  const getCategoryId = (item: CorporateMemberDto) => {
    if (typeof item.category === 'string') return item.category
    return item.category?._id || item.category?.id || ''
  }

  const handleChange = (field: keyof CorporateFormState, value: string | number | boolean) => {
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
      const imageUrl = await uploadCorporateImage(file)
      setForm((prev) => ({ ...prev, imageUrl }))
      setFieldErrors((prev) => {
        if (!prev.imageUrl) return prev
        const next = { ...prev }
        delete next.imageUrl
        return next
      })
      setSuccess('Image uploaded successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Image upload failed.'
      setError(message)
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
    `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
      hasError ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 focus:ring-primary/30 focus:border-primary'
    }`

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    if (!canCreate) {
      setError('You do not have permission to create corporate members.')
      return
    }

    const validationErrors = validateCorporateMemberForm(form)
    if (hasFieldErrors(validationErrors)) {
      setFieldErrors(validationErrors as Partial<Record<keyof CorporateFormState, string>>)
      setError('Please correct the highlighted fields and try again.')
      return
    }

    try {
      setSubmitting(true)
      const created = await createCorporateMember({
        name: form.name.trim(),
        position: form.position.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        imageUrl: form.imageUrl.trim() || undefined,
        categoryId: form.categoryId || undefined,
        activeStatus: form.activeStatus,
        displayOrder: orderedMembers.length + 1,
      })

      setMembers((prev) => [created, ...prev])
      setSuccess('Corporate member created successfully.')
      resetForm()
    } catch (err: any) {
      const parsed = parseApiValidationErrors(err)
      setFieldErrors(parsed.fieldErrors as Partial<Record<keyof CorporateFormState, string>>)
      setError(parsed.message || 'Failed to create corporate member.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete corporate members.')
      return
    }

    setConfirmState({
      title: 'Delete Member',
      description: 'Delete this corporate member? You can restore it later from Deleted.',
      confirmLabel: 'Delete',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading((prev) => ({ ...prev, [itemId]: true }))
          setError('')
          await removeCorporateMember(itemId)
          setMembers((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
          const deleted = await fetchDeletedCorporateMembers()
          setDeletedMembers(deleted)
          setSuccess('Corporate member deleted successfully.')
        } catch (err: any) {
          const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete member.'
          setError(message)
        } finally {
          setActionLoading((prev) => ({ ...prev, [itemId]: false }))
        }
      },
    })
  }

  const handleRestore = async (itemId: string) => {
    if (!canDelete) {
      setError('You do not have permission to restore corporate members.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [itemId]: true }))
      setError('')
      const restored = await restoreCorporateMember(itemId)
      setDeletedMembers((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
      setMembers((prev) => [restored, ...prev])
      setSuccess('Corporate member restored successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to restore member.'
      setError(message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const handlePermanentDelete = async (itemId: string) => {
    if (!canDelete) {
      setError('You do not have permission to permanently delete members.')
      return
    }

    setConfirmState({
      title: 'Permanently Delete Member',
      description: 'Permanently delete this member? This action cannot be undone.',
      confirmLabel: 'Delete Permanently',
      intent: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading((prev) => ({ ...prev, [itemId]: true }))
          setError('')
          await permanentlyDeleteCorporateMember(itemId)
          setDeletedMembers((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
          setSuccess('Corporate member permanently deleted.')
        } catch (err: any) {
          const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to permanently delete member.'
          setError(message)
        } finally {
          setActionLoading((prev) => ({ ...prev, [itemId]: false }))
        }
      },
    })
  }

  const moveMember = async (index: number, direction: 'up' | 'down') => {
    if (!canEdit) {
      setError('You do not have permission to reorder corporate members.')
      return
    }

    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= orderedMembers.length) return

    const next = [...orderedMembers]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)

    const orderedIds = next
      .map((member) => member.id || member._id)
      .filter((id): id is string => Boolean(id))

    if (orderedIds.length !== next.length) {
      setError('Cannot reorder due to invalid member id.')
      return
    }

    try {
      setReordering(true)
      setError('')
      const data = await reorderCorporateMembers(orderedIds)
      setMembers(data)
      setSuccess('Corporate member order updated.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to reorder corporate members.'
      setError(message)
    } finally {
      setReordering(false)
    }
  }

  // Edit handlers
  const handleEditClick = (item: CorporateMemberDto) => {
    setEditingItem(item)
    setEditForm({
      name: item.name || '',
      position: item.position || '',
      phone: item.phone || '',
      email: item.email || '',
      imageUrl: item.imageUrl || '',
      categoryId: getCategoryId(item),
      activeStatus: item.activeStatus ?? true,
    })
    setEditModalOpen(true)
  }

  const handleEditChange = (field: keyof CorporateFormState, value: string | number | boolean) => {
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
      const imageUrl = await uploadCorporateImage(file)
      setEditForm((prev) => ({ ...prev, imageUrl }))
      setEditFieldErrors((prev) => {
        if (!prev.imageUrl) return prev
        const next = { ...prev }
        delete next.imageUrl
        return next
      })
      setSuccess('Image uploaded successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Image upload failed.'
      setError(message)
    } finally {
      setEditUploading(false)
      event.target.value = ''
    }
  }

  const handleCategoryChange = (field: keyof CategoryFormState, value: string | number | boolean) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategorySubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!canCreate) {
      setError('You do not have permission to create corporate categories.')
      return
    }

    if (!categoryForm.name.trim()) {
      setError('Category name is required.')
      return
    }

    try {
      setCategorySubmitting(true)
      const created = await createCorporateCategory({
        name: categoryForm.name.trim(),
        activeStatus: categoryForm.activeStatus,
        displayOrder: Number(categoryForm.displayOrder || 0),
      })

      setCategories((prev) => [...prev, created])
      setCategoryForm(createInitialCategoryFormState())
      setSuccess('Corporate category created successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to create category.'
      setError(message)
    } finally {
      setCategorySubmitting(false)
    }
  }

  const handleCategoryEditClick = (category: CorporateCategoryDto) => {
    const id = category.id || category._id || ''
    if (!id) return
    setCategoryEditingId(id)
    setCategoryEditForm({
      name: category.name || '',
      activeStatus: category.activeStatus ?? true,
      displayOrder: Number(category.displayOrder || 0),
    })
  }

  const handleCategoryEditSubmit = async () => {
    if (!categoryEditingId || !canEdit) return

    if (!categoryEditForm.name.trim()) {
      setError('Category name is required.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [categoryEditingId]: true }))
      setError('')
      const updated = await updateCorporateCategory(categoryEditingId, {
        name: categoryEditForm.name.trim(),
        activeStatus: categoryEditForm.activeStatus,
        displayOrder: Number(categoryEditForm.displayOrder || 0),
      })

      setCategories((prev) =>
        prev.map((item) => ((item.id || item._id) === categoryEditingId ? updated : item))
      )
      setCategoryEditingId('')
      setSuccess('Corporate category updated successfully.')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to update category.'
      setError(message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [categoryEditingId]: false }))
    }
  }

  const handleCategoryDelete = async (categoryId: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete corporate categories.')
      return
    }

    setConfirmState({
      title: 'Delete Category',
      description: 'Delete this category? Members in this category will move to Uncategorized.',
      confirmLabel: 'Delete Category',
      intent: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading((prev) => ({ ...prev, [categoryId]: true }))
          setError('')
          await deleteCorporateCategory(categoryId)
          setCategories((prev) => prev.filter((item) => (item.id || item._id) !== categoryId))
          setMembers((prev) => prev.map((item) => (getCategoryId(item) === categoryId ? { ...item, category: null } : item)))
          setSuccess('Corporate category deleted successfully.')
        } catch (err: any) {
          const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete category.'
          setError(message)
        } finally {
          setActionLoading((prev) => ({ ...prev, [categoryId]: false }))
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

  const handleEditSubmit = async () => {
    if (!editingItem || !canEdit) return

    const itemId = editingItem.id || editingItem._id
    if (!itemId) return

    setEditFieldErrors({})
    const validationErrors = validateCorporateMemberForm(editForm)
    if (hasFieldErrors(validationErrors)) {
      setEditFieldErrors(validationErrors as Partial<Record<keyof CorporateFormState, string>>)
      setError('Please correct the highlighted fields before saving.')
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [itemId]: true }))
      setError('')
      const updated = await updateCorporateMember(itemId, {
        name: editForm.name.trim(),
        position: editForm.position.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim().toLowerCase(),
        imageUrl: editForm.imageUrl.trim() || undefined,
        categoryId: editForm.categoryId || undefined,
        activeStatus: editForm.activeStatus,
      })

      setMembers((prev) =>
        prev.map((item) => ((item.id || item._id) === itemId ? updated : item))
      )
      setSuccess('Corporate member updated successfully.')
      closeEditPanel()
    } catch (err: any) {
      const parsed = parseApiValidationErrors(err)
      setEditFieldErrors(parsed.fieldErrors as Partial<Record<keyof CorporateFormState, string>>)
      setError(parsed.message || 'Failed to update member.')
      console.error(err)
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentList = showDeletedTab ? deletedMembers : orderedMembers
  const memberId = (item: CorporateMemberDto) => item.id ?? item._id ?? ''
  const editingMemberId = editingItem ? memberId(editingItem) : ''

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminPageHeader
          title="Corporate Members Management"
          subtitle="Create, edit, reorder, and manage leadership profiles."
          icon={Users}
        />

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium text-red-700">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium text-emerald-700">{success}</p>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          {!showDeletedTab && (
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                    <h2 className="text-lg font-bold text-secondary">Categories</h2>
                  </div>

                  <div className="p-5">
                    <form onSubmit={handleCategorySubmit} className="space-y-3 mb-5">
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => handleCategoryChange('name', e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        placeholder="e.g. Board of Directors"
                      />
                      <div className="flex items-center justify-between">
                        <ToggleSwitch
                          checked={categoryForm.activeStatus}
                          onChange={(checked) => handleCategoryChange('activeStatus', checked)}
                          label="Active"
                        />
                        <ActionButton
                          label={categorySubmitting ? 'Adding...' : 'Add'}
                          onClick={() => {}}
                          type="submit"
                          disabled={categorySubmitting}
                          icon={categorySubmitting ? Loader2 : undefined}
                          variant="primary"
                          className={categorySubmitting ? '[&>svg]:animate-spin' : ''}
                        />
                      </div>
                    </form>

                    <div className="space-y-2">
                      {orderedCategories.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No categories yet.</p>
                      ) : (
                        orderedCategories.map((category) => {
                          const id = category.id || category._id || ''
                          const isEditing = categoryEditingId === id
                          const isBusy = Boolean(id && actionLoading[id])

                          return (
                            <div key={id} className={`rounded-xl border px-4 py-3 transition-all ${isEditing ? 'border-primary/40 bg-primary/[0.03] shadow-sm' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}>
                              {isEditing ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={categoryEditForm.name}
                                    onChange={(e) => setCategoryEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                  />
                                  <ToggleSwitch
                                    checked={categoryEditForm.activeStatus}
                                    onChange={(checked) => setCategoryEditForm((prev) => ({ ...prev, activeStatus: checked }))}
                                    label="Active"
                                  />
                                  <div className="flex gap-2">
                                    <ActionButton
                                      label="Save"
                                      onClick={handleCategoryEditSubmit}
                                      disabled={isBusy}
                                      variant="primary"
                                      className="flex-1"
                                    />
                                    <ActionButton
                                      label="Cancel"
                                      onClick={() => setCategoryEditingId('')}
                                      variant="neutral"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${category.activeStatus ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                                    <span className="text-sm font-medium text-gray-800 truncate">{category.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ActionButton
                                      label="Edit"
                                      onClick={() => handleCategoryEditClick(category)}
                                      icon={Pencil}
                                      variant="edit"
                                      iconOnly
                                      size="xs"
                                    />
                                    <ActionButton
                                      label="Delete"
                                      onClick={() => id && handleCategoryDelete(id)}
                                      disabled={isBusy}
                                      icon={isBusy ? Loader2 : Trash2}
                                      variant="delete"
                                      iconOnly
                                      size="xs"
                                      className={isBusy ? '[&>svg]:animate-spin' : ''}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                    <h2 className="text-lg font-bold text-secondary">Add New Member</h2>
                  </div>

                  <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      
                      <div className="space-y-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Full Name *</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={inputClassName(Boolean(fieldErrors.name))}
                            placeholder="e.g. Dr. Jane Smith"
                          />
                          {fieldErrors.name ? <p className="mt-1.5 text-xs text-red-600">{fieldErrors.name}</p> : null}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Position *</label>
                          <input
                            type="text"
                            value={form.position}
                            onChange={(e) => handleChange('position', e.target.value)}
                            className={inputClassName(Boolean(fieldErrors.position))}
                            placeholder="e.g. Chief Executive Officer"
                          />
                          {fieldErrors.position ? <p className="mt-1.5 text-xs text-red-600">{fieldErrors.position}</p> : null}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Category *</label>
                          <select
                            value={form.categoryId}
                            onChange={(e) => handleChange('categoryId', e.target.value)}
                            className={inputClassName(Boolean(fieldErrors.categoryId))}
                            disabled={selectableCategories.length === 0}
                          >
                            <option value="" disabled>Select a category</option>
                            {selectableCategories.map((category) => (
                              <option key={category.id || category._id} value={category.id || category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.categoryId ? <p className="mt-1.5 text-xs text-red-600">{fieldErrors.categoryId}</p> : null}
                          {selectableCategories.length === 0 && (
                            <p className="mt-1.5 text-xs text-amber-600 font-medium">Please add a category first.</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Phone *
                          </label>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className={inputClassName(Boolean(fieldErrors.phone))}
                            placeholder="+94 11 260 1001"
                          />
                          {fieldErrors.phone ? <p className="mt-1.5 text-xs text-red-600">{fieldErrors.phone}</p> : null}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email *
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={inputClassName(Boolean(fieldErrors.email))}
                            placeholder="director@nso.lk"
                          />
                          {fieldErrors.email ? <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p> : null}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Profile Photo</label>
                        
                        {form.imageUrl ? (
                          <div className="relative mb-3 group">
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-medium">Click to change</span>
                            </div>
                            <img
                              src={resolveMediaUrl(form.imageUrl)}
                              alt="Preview"
                              className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleChange('imageUrl', '')}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 hover:border-primary/50 transition-colors mb-3">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-6 h-6 mb-2 text-gray-400" />
                              <p className="text-sm text-gray-500"><span className="font-medium text-primary">Click to upload</span> or drag</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                          </label>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={form.imageUrl}
                            onChange={(e) => handleChange('imageUrl', e.target.value)}
                            className={`flex-1 px-3 py-2 bg-white border rounded-lg text-xs focus:outline-none focus:ring-2 transition ${fieldErrors.imageUrl ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 focus:ring-primary/30 focus:border-primary'}`}
                            placeholder="Or paste image URL"
                          />
                        </div>
                        {fieldErrors.imageUrl ? <p className="mt-1.5 text-xs text-red-600">{fieldErrors.imageUrl}</p> : null}
                      </div>

                      <ToggleSwitch
                        checked={form.activeStatus}
                        onChange={(checked) => handleChange('activeStatus', checked)}
                        label="Profile Status"
                      />

                      <ActionButton
                        label={submitting || uploadingImage ? 'Processing...' : 'Create Member Profile'}
                        onClick={() => {}}
                        type="submit"
                        disabled={submitting || uploadingImage || selectableCategories.length === 0}
                        icon={submitting || uploadingImage ? Loader2 : undefined}
                        variant="primary"
                        size="md"
                        className={`w-full ${submitting || uploadingImage ? '[&>svg]:animate-spin' : ''}`}
                      />
                    </form>
                  </div>
                </div>
            </div>
          </div>
          )}

          {/* Members List */}
          <div className={showDeletedTab ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-accent/5">
                <h2 className="text-lg font-bold text-secondary">
                  {showDeletedTab ? 'Deleted Profiles' : 'Active Profiles'}
                </h2>
                <div className="flex p-0.5 bg-gray-100 rounded-xl">
                  <ActionButton
                    label={`Active (${members.length})`}
                    onClick={() => setShowDeletedTab(false)}
                    variant={!showDeletedTab ? 'primary' : 'view'}
                    size="xs"
                  />
                  <ActionButton
                    label={`Deleted (${deletedMembers.length})`}
                    onClick={() => setShowDeletedTab(true)}
                    variant={showDeletedTab ? 'delete' : 'view'}
                    size="xs"
                  />
                </div>
              </div>

              <div className="p-6">
                {!showDeletedTab && orderedMembers.length > 1 && (
                  <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3">
                    <div className="p-1.5 bg-white rounded-lg border border-primary/10 shadow-sm mt-0.5">
                      <ArrowUp className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Use the arrows on the right of each card to reorder members. Higher members appear first on public profiles.
                    </p>
                  </div>
                )}
                
                {currentList.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No corporate members found</p>
                    <p className="text-xs text-gray-400 mt-1">Add a new member profile to see them listed here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentList.map((item, index) => (
                      (() => {
                        const id = memberId(item)
                        const isBusy = Boolean(id && actionLoading[id])
                        const orderValue = item.displayOrder ?? index + 1
                        const categoryLabel = (() => {
                          if (item.category && typeof item.category === 'object' && 'name' in item.category) {
                            return item.category.name
                          }
                          if (typeof item.category === 'string') {
                            const match = categories.find((category) => (category.id || category._id) === item.category)
                            return match?.name || 'Uncategorized'
                          }
                          return 'Uncategorized'
                        })()

                        return (
                          <div
                            key={id || `${item.email}-${index}`}
                            className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md animate-card-in overflow-hidden"
                            style={{ animationDelay: `${index * 60}ms` }}
                          >
                            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <div className="p-5">
                              <div className="flex flex-col md:flex-row gap-5 items-start">
                                {/* Details column */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  {item.imageUrl ? (
                                    <div className="relative">
                                      <img
                                        src={resolveMediaUrl(item.imageUrl)}
                                        alt={item.name}
                                        className="h-[84px] w-[84px] rounded-2xl object-cover ring-1 ring-gray-100 shadow-sm flex-shrink-0"
                                      />
                                      <div className={`absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-white ${item.activeStatus ? 'bg-emerald-500' : 'bg-gray-300'}`} title={item.activeStatus ? 'Active' : 'Inactive'} />
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <div className="h-[84px] w-[84px] rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 text-primary ring-1 ring-primary/10 flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
                                        {getInitials(item.name || '')}
                                      </div>
                                      <div className={`absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-white ${item.activeStatus ? 'bg-emerald-500' : 'bg-gray-300'}`} title={item.activeStatus ? 'Active' : 'Inactive'} />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-bold text-secondary truncate">{item.name}</h3>
                                    <p className="text-sm font-medium text-primary mt-0.5 truncate">{item.position}</p>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-700 uppercase">
                                        {categoryLabel}
                                      </span>
                                      {showDeletedTab && (
                                        <span className="inline-flex items-center rounded-lg bg-red-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-red-700 uppercase">
                                          Deleted
                                        </span>
                                      )}
                                      {!showDeletedTab && (
                                        <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary uppercase">
                                          Order #{orderValue}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Contact info & Actions column */}
                                <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[280px]">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 text-[13px] text-gray-600">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-3 w-3 text-primary" />
                                      </div>
                                      <span className="truncate">{item.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-3 w-3 text-primary" />
                                      </div>
                                      <span className="truncate">{item.email}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-end gap-2 pt-2 mt-auto">
                                    {!showDeletedTab ? (
                                      <>
                                        {canEdit && (
                                          <div className="flex items-center bg-white rounded-lg p-1 border border-primary/20 shadow-sm mr-2 opacity-100 transition-opacity">
                                            <ActionButton
                                              label="Move Up"
                                              onClick={() => void moveMember(index, 'up')}
                                              disabled={index === 0 || reordering}
                                              icon={ArrowUp}
                                              variant="view"
                                              iconOnly
                                              size="xs"
                                            />
                                            <div className="w-px h-4 bg-gray-200 mx-1" />
                                            <ActionButton
                                              label="Move Down"
                                              onClick={() => void moveMember(index, 'down')}
                                              disabled={index === orderedMembers.length - 1 || reordering}
                                              icon={ArrowDown}
                                              variant="view"
                                              iconOnly
                                              size="xs"
                                            />
                                          </div>
                                        )}
                                        {canEdit && (
                                          <ActionButton
                                            label="Edit"
                                            onClick={() => handleEditClick(item)}
                                            icon={Pencil}
                                            variant="edit"
                                            size="xs"
                                          />
                                        )}
                                        {canDelete && (
                                          <ActionButton
                                            label={isBusy ? 'Deleting...' : 'Delete'}
                                            onClick={() => id && handleDelete(id)}
                                            disabled={!id || isBusy}
                                            icon={isBusy ? Loader2 : Trash2}
                                            variant="delete"
                                            size="xs"
                                            className={isBusy ? '[&>svg]:animate-spin' : ''}
                                          />
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {canDelete && (
                                          <ActionButton
                                            label={isBusy ? 'Restoring...' : 'Restore'}
                                            onClick={() => id && handleRestore(id)}
                                            disabled={!id || isBusy}
                                            icon={isBusy ? Loader2 : RotateCcw}
                                            variant="restore"
                                            size="xs"
                                            className={isBusy ? '[&>svg]:animate-spin' : ''}
                                          />
                                        )}
                                        {canDelete && (
                                          <ActionButton
                                            label={isBusy ? 'Deleting...' : 'Delete Forever'}
                                            onClick={() => id && handlePermanentDelete(id)}
                                            disabled={!id || isBusy}
                                            icon={isBusy ? Loader2 : X}
                                            variant="permanentDelete"
                                            size="xs"
                                            className={isBusy ? '[&>svg]:animate-spin' : ''}
                                          />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Slide-over Panel */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={closeEditPanel} />
          <div className="fixed inset-y-0 right-0 max-w-xl w-full flex">
            <div className={`w-full bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${closingPanel ? 'translate-x-full' : 'translate-x-0 slide-in-from-right'}`}>
              
              <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-secondary">Edit Member Profile</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Update leadership details and profile status.</p>
                </div>
                <button
                  onClick={closeEditPanel}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white transition-colors border border-transparent hover:border-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className={inputClassName(Boolean(editFieldErrors.name))}
                          placeholder="Full name"
                        />
                        {editFieldErrors.name ? <p className="mt-1.5 text-xs text-red-600">{editFieldErrors.name}</p> : null}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Position *</label>
                        <input
                          type="text"
                          value={editForm.position}
                          onChange={(e) => handleEditChange('position', e.target.value)}
                          className={inputClassName(Boolean(editFieldErrors.position))}
                          placeholder="e.g. CEO, Director"
                        />
                        {editFieldErrors.position ? <p className="mt-1.5 text-xs text-red-600">{editFieldErrors.position}</p> : null}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Category</label>
                      <select
                        value={editForm.categoryId}
                        onChange={(e) => handleEditChange('categoryId', e.target.value)}
                        className={inputClassName(Boolean(editFieldErrors.categoryId))}
                      >
                        <option value="">Uncategorized</option>
                        {selectableCategories.map((category) => (
                          <option key={category.id || category._id} value={category.id || category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {editFieldErrors.categoryId ? <p className="mt-1.5 text-xs text-red-600">{editFieldErrors.categoryId}</p> : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone *
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                          className={inputClassName(Boolean(editFieldErrors.phone))}
                          placeholder="+94 11 260 1001"
                        />
                        {editFieldErrors.phone ? <p className="mt-1.5 text-xs text-red-600">{editFieldErrors.phone}</p> : null}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email *
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          className={inputClassName(Boolean(editFieldErrors.email))}
                          placeholder="email@nso.lk"
                        />
                        {editFieldErrors.email ? <p className="mt-1.5 text-xs text-red-600">{editFieldErrors.email}</p> : null}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Profile Photo</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={editForm.imageUrl}
                        onChange={(e) => handleEditChange('imageUrl', e.target.value)}
                        className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${editFieldErrors.imageUrl ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 focus:ring-primary/30 focus:border-primary'}`}
                        placeholder="Image URL"
                      />
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary/30 transition text-sm font-medium text-gray-700">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="hidden sm:inline">Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          disabled={editUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {editFieldErrors.imageUrl ? <p className="mt-1.5 text-xs text-red-600">{editFieldErrors.imageUrl}</p> : null}

                    {editForm.imageUrl && (
                      <div className="relative group rounded-xl overflow-hidden border border-gray-200 max-w-[200px]">
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleEditChange('imageUrl', '')}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <img
                          src={resolveMediaUrl(editForm.imageUrl)}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <ToggleSwitch
                    checked={editForm.activeStatus}
                    onChange={(checked) => handleEditChange('activeStatus', checked)}
                    label="Profile Status"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-border bg-gray-50/80 mt-auto sticky bottom-0">
                <div className="flex gap-3">
                  <ActionButton
                    label="Cancel"
                    onClick={closeEditPanel}
                    variant="neutral"
                    className="flex-1"
                  />
                  <ActionButton
                    label={editingMemberId && actionLoading[editingMemberId] ? 'Saving Changes...' : 'Save Profile'}
                    onClick={handleEditSubmit}
                    disabled={!editingMemberId || actionLoading[editingMemberId] || editUploading}
                    icon={editingMemberId && actionLoading[editingMemberId] ? Loader2 : Save}
                    variant="primary"
                    className={`flex-[2] ${editingMemberId && actionLoading[editingMemberId] ? '[&>svg]:animate-spin' : ''}`}
                  />
                </div>
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
