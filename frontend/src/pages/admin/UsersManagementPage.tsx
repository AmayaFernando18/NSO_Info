import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Trash2,
  Edit,
  Shield,
  AlertCircle,
  Search,
  Users,
  UserCog,
  ShieldCheck,
  X,
  CheckCircle2,
  ChevronDown,
  Info,
  RefreshCw,
} from 'lucide-react'
import { fetchUsers, assignUserAccess, removeUserAccess, type RbacUser } from '../../services/usersService'
import PermissionPill from '../../components/admin/PermissionPill'
import type { AuthorityCode, FunctionCode } from '../../types'
import { RBAC_FUNCTION, RBAC_FUNCTIONS } from '../../constants/rbac'
import { useUser } from '../../context/UserContext'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

// Authority descriptions for tooltips
const AUTHORITY_INFO: Record<AuthorityCode, { label: string; description: string; color: string }> = {
  E: { label: 'Enter', description: 'View + Create; can edit only unapproved content', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  C: { label: 'Check', description: 'View only access', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  A: { label: 'Approve', description: 'View + Approve/Reject content', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  M: { label: 'Manager', description: 'Full access: View, Create, Edit, Delete, Approve', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
}

export default function UsersManagementPage() {
  const { user: currentUser } = useUser()
  const [users, setUsers] = useState<RbacUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<RbacUser | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formUsername, setFormUsername] = useState('')
  const [formIsSuperAdmin, setFormIsSuperAdmin] = useState(false)
  const [formPermissions, setFormPermissions] = useState<Array<{ function: FunctionCode; authority: AuthorityCode }>>([])

  // Check if current user is superadmin (required for all operations)
  const isSuperAdmin = currentUser?.isSuperAdmin ?? false

  useEffect(() => {
    loadUsers()
  }, [])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await fetchUsers()
      setUsers(data)
      setError('')
    } catch (err) {
      setError('Failed to load users. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filtered users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        (u.isSuperAdmin && 'superadmin'.includes(query)) ||
        u.functionPermissions?.some((p) => p.function.toLowerCase().includes(query))
    )
  }, [users, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = users.length
    const superAdmins = users.filter((u) => u.isSuperAdmin).length
    const regularUsers = total - superAdmins
    const withPermissions = users.filter((u) => !u.isSuperAdmin && u.functionPermissions?.length > 0).length
    return { total, superAdmins, regularUsers, withPermissions }
  }, [users])

  const openAddModal = () => {
    if (!isSuperAdmin) return
    setEditingUser(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (user: RbacUser) => {
    if (!isSuperAdmin) return
    setEditingUser(user)
    setFormUsername(user.username)
    setFormIsSuperAdmin(user.isSuperAdmin)
    setFormPermissions(user.functionPermissions || [])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    resetForm()
  }

  const handleDelete = async (username: string) => {
    if (!isSuperAdmin) return

    try {
      setSubmitting(true)
      setError('')
      const result = await removeUserAccess(username)
      console.log('Delete result:', result)
      setDeleteConfirm(null)
      setSuccess(`User "${username}" access removed successfully.`)
      // Force reload users list
      setUsers((prev) => prev.filter((u) => u.username !== username))
      await loadUsers()
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err?.response?.data?.error || err?.message || 'Failed to delete user access. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSuperAdmin) return

    if (!formUsername.trim()) {
      setError('Username (EPF Number) is required.')
      return
    }

    if (!formIsSuperAdmin && formPermissions.length === 0) {
      setError('Please add at least one function permission or enable SuperAdmin.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const result = await assignUserAccess({
        username: formUsername.trim(),
        isSuperAdmin: formIsSuperAdmin,
        functionPermissions: formIsSuperAdmin ? [] : formPermissions,
      })

      const duplicateMessage =
        result.warnings.length > 0
          ? ` Duplicates merged: ${result.warnings
              .map((w) => `${w.function} (${w.discardedAuthorities.join(', ')} -> ${w.keptAuthority})`)
              .join('; ')}.`
          : ''

      setSuccess(
        (editingUser ? `User "${formUsername}" updated successfully.` : `User "${formUsername}" added successfully.`) +
          duplicateMessage
      )
      closeModal()
      await loadUsers()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save user access. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormUsername('')
    setFormIsSuperAdmin(false)
    setFormPermissions([])
  }

  const addPermission = () => {
    setFormPermissions([...formPermissions, { function: RBAC_FUNCTION.NEWS, authority: 'E' }])
  }

  const updatePermission = (index: number, field: 'function' | 'authority', value: string) => {
    const updated = [...formPermissions]
    updated[index] = { ...updated[index], [field]: value as any }
    setFormPermissions(updated)
  }

  const removePermission = (index: number) => {
    setFormPermissions(formPermissions.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Access Management"
        subtitle="Manage RBAC permissions for system users"
        icon={ShieldCheck}
        actions={
          isSuperAdmin ? (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          ) : null
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-xs text-blue-600/70">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border border-red-200/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.superAdmins}</p>
              <p className="text-xs text-red-600/70">SuperAdmins</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg">
              <UserCog className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats.regularUsers}</p>
              <p className="text-xs text-emerald-600/70">Regular Users</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{stats.withPermissions}</p>
              <p className="text-xs text-amber-600/70">With Permissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">{success}</p>
        </div>
      )}

      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or function..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Function Permissions</th>
                {isSuperAdmin && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.username} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {user.username.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-secondary">{user.username}</div>
                        <div className="text-xs text-gray-500">EPF Number</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-100 to-red-50 text-red-700 text-xs font-semibold border border-red-200">
                        <Shield className="h-3.5 w-3.5" />
                        SuperAdmin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
                        <UserCog className="h-3.5 w-3.5" />
                        Standard User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Full Access to All Functions
                      </span>
                    ) : user.functionPermissions && user.functionPermissions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.functionPermissions.map((perm, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200"
                          >
                            <span className="text-xs font-semibold text-secondary">{perm.function}</span>
                            <span className="text-gray-300">|</span>
                            <PermissionPill authority={perm.authority} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.username)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">
                          {searchQuery ? 'No users match your search' : 'No users found'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery ? 'Try a different search term' : 'Click "Add User" to create one'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Matrix Reference */}
      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-secondary">Permission Reference</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(AUTHORITY_INFO) as [AuthorityCode, typeof AUTHORITY_INFO['E']][]).map(([code, info]) => (
            <div key={code} className={`rounded-lg p-3 border ${info.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{code}</span>
                <span className="font-medium">{info.label}</span>
              </div>
              <p className="text-xs opacity-80">{info.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {editingUser ? <Edit className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary">
                      {editingUser ? 'Edit User Access' : 'Add New User'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {editingUser ? 'Modify permissions for this user' : 'Assign RBAC permissions to a user'}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Username (EPF Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  disabled={!!editingUser}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  placeholder="e.g., 123456"
                />
              </div>

              {/* SuperAdmin Toggle */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsSuperAdmin}
                    onChange={(e) => setFormIsSuperAdmin(e.target.checked)}
                    className="w-5 h-5 text-red-600 border-red-300 rounded focus:ring-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <span className="font-semibold text-secondary">SuperAdmin</span>
                      <p className="text-xs text-gray-500">Full access to all functions and user management</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Function Permissions */}
              {!formIsSuperAdmin && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-secondary">
                      Function Permissions <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addPermission}
                      className="text-sm text-primary hover:text-accent font-medium flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Permission
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formPermissions.map((perm, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="relative">
                            <select
                              value={perm.function}
                              onChange={(e) => updatePermission(index, 'function', e.target.value)}
                              className="w-full px-3 py-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer text-sm"
                            >
                              {RBAC_FUNCTIONS.map((func) => (
                                <option key={func} value={func}>
                                  {func}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          </div>
                          <div className="relative">
                            <select
                              value={perm.authority}
                              onChange={(e) => updatePermission(index, 'authority', e.target.value)}
                              className="w-full px-3 py-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer text-sm"
                            >
                              {(Object.entries(AUTHORITY_INFO) as [AuthorityCode, typeof AUTHORITY_INFO['E']][]).map(
                                ([code, info]) => (
                                  <option key={code} value={code}>
                                    {code} - {info.label}
                                  </option>
                                )
                              )}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePermission(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {formPermissions.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <UserCog className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No permissions added</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Permission" to assign one or more permission types</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 border border-border rounded-xl hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {editingUser ? 'Update User' : 'Add User'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Remove User Access</h3>
              <p className="text-gray-600 mb-1">
                Are you sure you want to remove access for user
              </p>
              <p className="font-semibold text-secondary text-lg mb-4">"{deleteConfirm}"?</p>
              <p className="text-sm text-gray-500 mb-6">
                This action will revoke all RBAC permissions for this user.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-border rounded-xl hover:bg-gray-100 transition-colors font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Remove Access
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
