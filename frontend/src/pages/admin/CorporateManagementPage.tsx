import { useEffect, useMemo, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { canPerformAction } from '../../utils/rbac'
import { RBAC_FUNCTION } from '../../constants/rbac'
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Loader2, Upload, X, Trash2, Pencil, Save, RotateCcw, Phone, Mail } from 'lucide-react'
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

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CorporateMemberDto | null>(null)
  const [editForm, setEditForm] = useState<CorporateFormState>(createInitialFormState)
  const [editUploading, setEditUploading] = useState(false)

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
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      setError('')
      const imageUrl = await uploadCorporateImage(file)
      setForm((prev) => ({ ...prev, imageUrl }))
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
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!canCreate) {
      setError('You do not have permission to create corporate members.')
      return
    }

    if (!form.name.trim() || !form.position.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Name, position, phone, and email are required.')
      return
    }

    if (!form.categoryId) {
      setError('Category is required.')
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
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to create corporate member.'
      setError(message)
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

    if (!confirm('Are you sure you want to delete this member?')) return

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

    if (!confirm('Permanently delete this member? This cannot be undone.')) return

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
  }

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setEditUploading(true)
      setError('')
      const imageUrl = await uploadCorporateImage(file)
      setEditForm((prev) => ({ ...prev, imageUrl }))
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

    if (!confirm('Delete this category? Members will be moved to Uncategorized.')) return

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
  }

  const handleEditSubmit = async () => {
    if (!editingItem || !canEdit) return

    const itemId = editingItem.id || editingItem._id
    if (!itemId) return

    if (!editForm.name.trim() || !editForm.position.trim() || !editForm.phone.trim() || !editForm.email.trim()) {
      setError('Name, position, phone, and email are required.')
      return
    }

    if (!editForm.categoryId) {
      setError('Category is required.')
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
      setEditModalOpen(false)
      setEditingItem(null)
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to update member.'
      setError(message)
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
        <div className="mb-8 rounded-2xl border border-border bg-white px-6 py-5 shadow-sm">
          <h1 className="text-3xl font-bold text-secondary">Corporate Members Management</h1>
          <p className="mt-2 text-sm text-gray-600">Create, edit, reorder, and manage leadership profiles with a modern publishing workflow.</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          {!showDeletedTab && (
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>

                  <form onSubmit={handleCategorySubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => handleCategoryChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Board of Directors"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="categoryActiveStatus"
                        checked={categoryForm.activeStatus}
                        onChange={(e) => handleCategoryChange('activeStatus', e.target.checked)}
                        className="h-4 w-4 border-gray-300 rounded"
                      />
                      <label htmlFor="categoryActiveStatus" className="text-sm text-gray-700">
                        Active
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={categorySubmitting}
                      className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-secondary/90 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                    >
                      {categorySubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Add Category'
                      )}
                    </button>
                  </form>

                  <div className="mt-5 space-y-3">
                    {orderedCategories.length === 0 ? (
                      <p className="text-sm text-gray-500">No categories yet.</p>
                    ) : (
                      orderedCategories.map((category) => {
                        const id = category.id || category._id || ''
                        const isEditing = categoryEditingId === id
                        const isBusy = Boolean(id && actionLoading[id])

                        return (
                          <div key={id} className="rounded-lg border border-border px-3 py-3">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={categoryEditForm.name}
                                  onChange={(e) => setCategoryEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`categoryActive-${id}`}
                                    checked={categoryEditForm.activeStatus}
                                    onChange={(e) =>
                                      setCategoryEditForm((prev) => ({ ...prev, activeStatus: e.target.checked }))
                                    }
                                    className="h-4 w-4 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`categoryActive-${id}`} className="text-xs text-gray-600">
                                    Active
                                  </label>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={handleCategoryEditSubmit}
                                    disabled={isBusy}
                                    className="flex-1 bg-primary text-white py-1.5 rounded-lg text-sm hover:bg-primary/90 disabled:bg-gray-400 transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCategoryEditingId('')}
                                    className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{category.name}</p>
                                  <span className={`text-xs ${category.activeStatus ? 'text-green-600' : 'text-gray-400'}`}>
                                    {category.activeStatus ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCategoryEditClick(category)}
                                    className="text-gray-500 hover:text-primary"
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => id && handleCategoryDelete(id)}
                                    className="text-gray-500 hover:text-red-600"
                                    title="Delete"
                                    disabled={isBusy}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {editModalOpen ? 'Edit Member' : 'Add New Member'}
                  </h2>

                  {!editModalOpen ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                      <input
                        type="text"
                        value={form.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Chairman, CEO, Director"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={selectableCategories.length === 0}
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {selectableCategories.map((category) => (
                          <option key={category.id || category._id} value={category.id || category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {selectableCategories.length === 0 && (
                        <p className="mt-1 text-xs text-gray-500">Add a category to assign members.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+94 11 260 1001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="email@nso.lk"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL or Upload</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={form.imageUrl}
                          onChange={(e) => handleChange('imageUrl', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm text-gray-600">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {form.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={resolveMediaUrl(form.imageUrl)}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="activeStatus"
                        checked={form.activeStatus}
                        onChange={(e) => handleChange('activeStatus', e.target.checked)}
                        className="h-4 w-4 border-gray-300 rounded"
                      />
                      <label htmlFor="activeStatus" className="text-sm text-gray-700">
                        Active
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || uploadingImage || selectableCategories.length === 0}
                      className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Member'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Edit mode open in list</p>
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="text-primary hover:underline text-sm"
                    >
                      Close Edit Modal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Members List */}
          <div className={showDeletedTab ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <div className="bg-white rounded-lg shadow">
              <div className="border-b px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-primary/5 to-accent/5">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showDeletedTab ? 'Deleted Members' : 'Active Members'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeletedTab(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      !showDeletedTab
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active ({members.length})
                  </button>
                  <button
                    onClick={() => setShowDeletedTab(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      showDeletedTab
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Deleted ({deletedMembers.length})
                  </button>
                </div>
              </div>

              {editModalOpen && editingItem && (
                <div className="border-b px-6 py-4 bg-blue-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                      <input
                        type="text"
                        value={editForm.position}
                        onChange={(e) => handleEditChange('position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Chairman, CEO, Director"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editForm.categoryId}
                        onChange={(e) => handleEditChange('categoryId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Uncategorized</option>
                        {selectableCategories.map((category) => (
                          <option key={category.id || category._id} value={category.id || category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleEditChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+94 11 260 1001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="email@nso.lk"
                      />
                    </div>

                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL or Upload</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editForm.imageUrl}
                        onChange={(e) => handleEditChange('imageUrl', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm text-gray-600">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        disabled={editUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {editForm.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={resolveMediaUrl(editForm.imageUrl)}
                        alt="Preview"
                        className="h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="editActiveStatus"
                      checked={editForm.activeStatus}
                      onChange={(e) => handleEditChange('activeStatus', e.target.checked)}
                      className="h-4 w-4 border-gray-300 rounded"
                    />
                    <label htmlFor="editActiveStatus" className="text-sm text-gray-700">
                      Active
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleEditSubmit}
                      disabled={!editingMemberId || actionLoading[editingMemberId]}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                    >
                      {editingMemberId && actionLoading[editingMemberId] ? (
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
                    <button
                      onClick={() => {
                        setEditModalOpen(false)
                        setEditingItem(null)
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6">
                {!showDeletedTab && orderedMembers.length > 1 && (
                  <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-gray-700">
                    Use the arrow controls to reorder members. Top items appear first in public profile listings.
                  </div>
                )}
                {currentList.length === 0 ? (
                  <div className="py-8 text-center text-gray-600">
                    <p>No corporate members found</p>
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
                            className="rounded-xl border border-border bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-md animate-card-in"
                            style={{ animationDelay: `${index * 70}ms` }}
                          >
                            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-gray-50/60 rounded-t-xl">
                              <div className="flex items-center gap-2.5">
                                {!showDeletedTab && (
                                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    Order #{orderValue}
                                  </span>
                                )}
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                  item.activeStatus ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.activeStatus ? 'Active' : 'Inactive'}
                                </span>
                                {showDeletedTab && (
                                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                    Deleted
                                  </span>
                                )}
                              </div>

                              {!showDeletedTab && canEdit && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => void moveMember(index, 'up')}
                                    disabled={index === 0 || reordering}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white text-gray-600 border border-border hover:bg-gray-50 disabled:opacity-40"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => void moveMember(index, 'down')}
                                    disabled={index === orderedMembers.length - 1 || reordering}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white text-gray-600 border border-border hover:bg-gray-50 disabled:opacity-40"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                                <div className="flex items-center gap-4 min-w-0 sm:w-[340px]">
                                  {item.imageUrl ? (
                                    <img
                                      src={resolveMediaUrl(item.imageUrl)}
                                      alt={item.name}
                                      className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 ring-4 ring-primary/10 flex items-center justify-center font-semibold text-xl flex-shrink-0">
                                      {getInitials(item.name || '')}
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-secondary truncate">{item.name}</h3>
                                    <p className="text-sm font-medium text-primary mt-0.5 truncate">{item.position}</p>
                                    <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                      {categoryLabel}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm text-gray-700">
                                  <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3 py-2 min-w-0">
                                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="truncate">{item.phone}</span>
                                  </div>
                                  <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3 py-2 min-w-0">
                                    <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="truncate">{item.email}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-border/60 flex justify-end gap-2">
                                {!showDeletedTab ? (
                                  <>
                                    {canEdit && (
                                      <button
                                        onClick={() => handleEditClick(item)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                        title="Edit"
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        onClick={() => {
                                          if (id) handleDelete(id)
                                        }}
                                        disabled={!id || isBusy}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                                        title="Delete"
                                      >
                                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Delete
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {canDelete && (
                                      <button
                                        onClick={() => {
                                          if (id) handleRestore(id)
                                        }}
                                        disabled={!id || isBusy}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                                        title="Restore"
                                      >
                                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                        Restore
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        onClick={() => {
                                          if (id) handlePermanentDelete(id)
                                        }}
                                        disabled={!id || isBusy}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                                        title="Permanently Delete"
                                      >
                                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                        Delete Permanently
                                      </button>
                                    )}
                                  </>
                                )}
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
    </div>
  )
}
