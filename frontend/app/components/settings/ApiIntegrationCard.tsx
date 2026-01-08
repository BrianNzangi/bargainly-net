'use client'

import { useState } from 'react'
import { CheckCircle, CloseCircle, Refresh, AltArrowDown, AltArrowUp, TrashBinTrash, Eye, EyeClosed } from '@solar-icons/react'

interface Setting {
    id: string
    key: string
    api_type?: string
    instance_name?: string
    category: string
    label: string
    description?: string | null
    value: Record<string, any>
    is_encrypted: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

interface ApiIntegrationCardProps {
    setting: Setting
    onUpdate: (key: string, value: Record<string, any>, isActive: boolean) => Promise<void>
    onTest: (key: string) => Promise<{ success: boolean; message: string }>
    onDelete: (key: string) => Promise<void>
}

export default function ApiIntegrationCard({ setting, onUpdate, onTest, onDelete }: ApiIntegrationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState(setting.value)
    const [isActive, setIsActive] = useState(setting.is_active)
    const [isSaving, setIsSaving] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
    const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({})

    const handleInputChange = (key: string, value: string) => {
        setFormData((prev: Record<string, any>) => ({ ...prev, [key]: value }))
    }

    const handleEdit = () => {
        setIsExpanded(true)
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)

            // Build data to save - send empty strings for unchanged encrypted fields
            const dataToSave: Record<string, any> = {}
            Object.keys(formData).forEach(key => {
                const currentValue = formData[key]
                const originalValue = setting.value[key]

                // Check if this is a masked value (contains **** pattern)
                const isMaskedValue = typeof currentValue === 'string' && currentValue.includes('****')

                // If it's a masked value, send empty string (backend will keep original)
                // Otherwise send the actual value
                if (isMaskedValue) {
                    dataToSave[key] = ''
                } else {
                    dataToSave[key] = currentValue
                }
            })

            console.log('Saving data:', dataToSave)
            await onUpdate(setting.key, dataToSave, isActive)
            setIsEditing(false)
            setTestResult(null)
        } catch (error) {
            console.error('Failed to save:', error)
            alert('Failed to save changes. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData(setting.value)
        setIsActive(setting.is_active)
        setIsEditing(false)
        setIsExpanded(false)
        setTestResult(null)
    }

    const handleTest = async () => {
        try {
            setIsTesting(true)
            const result = await onTest(setting.key)
            setTestResult(result)
        } catch (error) {
            setTestResult({ success: false, message: 'Failed to test connection' })
        } finally {
            setIsTesting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${setting.label}?`)) {
            return
        }

        try {
            setIsDeleting(true)
            await onDelete(setting.key)
        } catch (error) {
            console.error('Failed to delete:', error)
            alert('Failed to delete API integration')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="rounded-lg border" style={{ backgroundColor: 'var(--neutral-50)', borderColor: 'var(--neutral-300)' }}>
            {/* Header - Always Visible */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>
                            {setting.label}
                        </h3>
                        {setting.description && !isExpanded && (
                            <p className="text-sm mt-1" style={{ color: 'var(--neutral-600)' }}>
                                {setting.description}
                            </p>
                        )}
                    </div>

                    {/* Status Badge, Edit Button, Delete Button, and Arrow */}
                    <div className="flex items-center space-x-3 ml-4">
                        {isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--green-100)', color: 'var(--green-800)' }}>
                                <CheckCircle size={14} className="mr-1" weight="Bold" />
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--neutral-200)', color: 'var(--neutral-700)' }}>
                                <CloseCircle size={14} className="mr-1" weight="Bold" />
                                Inactive
                            </span>
                        )}

                        {!isEditing && (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="px-3 py-1.5 rounded-md text-sm font-medium text-accent-900 hover:opacity-90 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="p-1.5 hover:bg-red-100 rounded transition disabled:opacity-50"
                                    title="Delete integration"
                                >
                                    <TrashBinTrash size={20} weight="Bold" style={{ color: 'var(--red-600)' }} />
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                        >
                            {isExpanded ? (
                                <AltArrowUp size={20} weight="Bold" style={{ color: 'var(--neutral-600)' }} />
                            ) : (
                                <AltArrowDown size={20} weight="Bold" style={{ color: 'var(--neutral-600)' }} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
                    {setting.description && (
                        <p className="text-sm mt-4 mb-4" style={{ color: 'var(--neutral-600)' }}>
                            {setting.description}
                        </p>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4 mb-4">
                        {Object.entries(formData).map(([key, value]) => {
                            const isSecretField = (key.includes('secret') || key.includes('key') || key.includes('token') || key.includes('password') || key.includes('tag')) && !key.includes('region')
                            // Check if value looks like an encrypted value (contains ':' separator from iv:ciphertext format)
                            const isEncryptedValue = typeof value === 'string' && value.includes(':') && value.length > 20 && !key.includes('region')
                            const displayValue = isEncryptedValue ? '' : (value as string)
                            const isVisible = fieldVisibility[key] || false

                            const toggleVisibility = () => {
                                setFieldVisibility(prev => ({ ...prev, [key]: !prev[key] }))
                            }

                            return (
                                <div key={key}>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--neutral-700)' }}>
                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={isSecretField && !isVisible ? 'password' : 'text'}
                                            value={displayValue}
                                            onChange={(e) => handleInputChange(key, e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            style={{
                                                borderColor: 'var(--neutral-300)',
                                                backgroundColor: isEditing ? 'white' : 'var(--neutral-100)',
                                                color: 'var(--neutral-900)',
                                                paddingRight: isSecretField ? '40px' : '12px'
                                            }}
                                            placeholder={
                                                isEditing
                                                    ? (isEncryptedValue ? `Enter new ${key} (leave blank to keep current)` : `Enter ${key}`)
                                                    : '••••••••'
                                            }
                                        />
                                        {isSecretField && (
                                            <button
                                                type="button"
                                                onClick={toggleVisibility}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition"
                                                tabIndex={-1}
                                            >
                                                {isVisible ? (
                                                    <Eye size={20} weight="Bold" style={{ color: 'var(--neutral-600)' }} />
                                                ) : (
                                                    <EyeClosed size={20} weight="Bold" style={{ color: 'var(--neutral-400)' }} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    {isEditing && isEncryptedValue && (
                                        <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
                                            Current value is encrypted. Leave blank to keep existing value, or enter new value to update.
                                        </p>
                                    )}
                                </div>
                            )
                        })}

                        {/* Active Toggle */}
                        {isEditing && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`active-${setting.key}`}
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`active-${setting.key}`} className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
                                    Enable this integration
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <div className={`rounded-md p-3 mb-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                {testResult.message}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
                        <div>
                            {!isEditing && isActive && (
                                <button
                                    onClick={handleTest}
                                    disabled={isTesting}
                                    className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                                    style={{ borderColor: 'var(--neutral-300)', color: 'var(--neutral-700)' }}
                                >
                                    {isTesting ? (
                                        <>
                                            <Refresh size={16} className="mr-1.5 animate-spin" weight="Bold" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <Refresh size={16} className="mr-1.5" weight="Bold" />
                                            Test Connection
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition"
                                        style={{ borderColor: 'var(--neutral-300)', color: 'var(--neutral-700)' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50"
                                        style={{ backgroundColor: 'var(--accent)' }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
