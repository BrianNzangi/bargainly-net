'use client'

import { useState } from 'react'
import { User, AddCircle } from '@solar-icons/react'

interface UserData {
    id: string
    email: string
    name: string
    image?: string | null
    role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'MARKETING'
    created_at: string
    last_login_at?: string | null
    is_enabled: boolean
}

interface Role {
    id: string
    name: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'MARKETING'
    description: string
    permissions: string[]
    created_at: string
    updated_at: string
}

interface UsersContentProps {
    users: UserData[]
    roles: Role[]
    onRefresh: () => void
    onUpdateRole: (id: string, data: Partial<Role>) => Promise<void>
}

export default function UsersContent({ users, roles, onRefresh, onUpdateRole }: UsersContentProps) {
    const [selectedRole, setSelectedRole] = useState<string>('all')

    const filteredUsers = selectedRole === 'all'
        ? users
        : users.filter(user => user.role === selectedRole)

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-700 border-red-200'
            case 'EDITOR':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'MARKETING':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'VIEWER':
                return 'bg-gray-100 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            {/* Header with Filter */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
                        Users ({filteredUsers.length})
                    </h2>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: 'var(--neutral-300)', color: 'var(--neutral-900)' }}
                    >
                        <option value="all">All Roles</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={onRefresh}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white hover:opacity-90 transition"
                    style={{ backgroundColor: 'var(--accent)' }}
                >
                    <AddCircle size={20} className="mr-2" weight="Bold" />
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--neutral-300)', backgroundColor: 'white' }}>
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--neutral-200)' }}>
                    <thead style={{ backgroundColor: 'var(--neutral-50)' }}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--neutral-600)' }}>
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--neutral-600)' }}>
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--neutral-600)' }}>
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--neutral-600)' }}>
                                Last Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--neutral-600)' }}>
                                Created
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--neutral-200)' }}>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <User size={48} className="mb-2" style={{ color: 'var(--neutral-400)' }} />
                                        <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                                            No users found
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-10 w-10">
                                                {user.image ? (
                                                    <img className="h-10 w-10 rounded-full" src={user.image} alt={user.name} />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--neutral-200)' }}>
                                                        <User size={20} style={{ color: 'var(--neutral-600)' }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium" style={{ color: 'var(--neutral-900)' }}>
                                                    {user.name}
                                                </div>
                                                <div className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_enabled
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.is_enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--neutral-500)' }}>
                                        {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--neutral-500)' }}>
                                        {formatDate(user.created_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Roles Section */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>
                    Available Roles
                </h3>
                <div className="space-y-4">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            userCount={users.filter(u => u.role === role.name).length}
                            getBadgeColor={getRoleBadgeColor}
                            onUpdate={onUpdateRole}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function RoleCard({ role, userCount, getBadgeColor, onUpdate }: {
    role: Role,
    userCount: number,
    getBadgeColor: (role: string) => string,
    onUpdate: (id: string, data: Partial<Role>) => Promise<void>
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [description, setDescription] = useState(role.description)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        try {
            setIsSaving(true)
            await onUpdate(role.id, { description })
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update role:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--neutral-300)', backgroundColor: 'white' }}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(role.name)}`}>
                            {role.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                            {userCount} users
                        </span>
                    </div>

                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: 'var(--neutral-300)' }}
                                rows={2}
                            />
                            <div className="flex mt-2 space-x-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setDescription(role.description)
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm mt-1" style={{ color: 'var(--neutral-600)' }}>
                            {description}
                        </p>
                    )}

                    <div className="mt-3">
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--neutral-700)' }}>
                            Permissions ({role.permissions.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{ backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-600)' }}
                                >
                                    {permission}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    )
}
