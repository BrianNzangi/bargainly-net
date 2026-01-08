'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SettingsHeader from '../../components/settings/SettingsHeader'
import SettingsTabs from '../../components/settings/SettingsTabs'
import ApiIntegrationsContent from '../../components/settings/ApiIntegrationsContent'
import UsersContent from '../../components/settings/UsersContent'
import SystemContent from '../../components/settings/SystemContent'
import { ApiTemplate, Setting } from '../../components/settings/types'

export default function SettingsPage() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab') as 'api' | 'users' | 'system' | null
    const [activeTab, setActiveTab] = useState<'api' | 'users' | 'system'>(tabParam || 'api')
    const [settings, setSettings] = useState<Setting[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [apiTemplates, setApiTemplates] = useState<ApiTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<ApiTemplate | null>(null)
    const [instanceName, setInstanceName] = useState('')
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [isSaving, setIsSaving] = useState(false)

    // Update tab when URL parameter changes
    useEffect(() => {
        if (tabParam && (tabParam === 'api' || tabParam === 'users' || tabParam === 'system')) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    useEffect(() => {
        if (activeTab === 'api') {
            fetchSettings()
            fetchApiTemplates()
        } else if (activeTab === 'users') {
            fetchUsers()
            fetchRoles()
        }
    }, [activeTab])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const category = activeTab === 'api' ? 'api_integration' : 'system'
            const response = await fetch(`http://localhost:3001/api/v1/settings?category=${category}`)

            if (!response.ok) {
                throw new Error('Failed to fetch settings')
            }

            const data = await response.json()
            setSettings(data.data || [])
        } catch (err: any) {
            setError(err.message)
            console.error('Error fetching settings:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`http://localhost:3001/api/v1/users`)

            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data || [])
        } catch (err: any) {
            setError(err.message)
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/roles`)

            if (!response.ok) {
                throw new Error('Failed to fetch roles')
            }

            const data = await response.json()
            setRoles(data || [])
        } catch (err: any) {
            console.error('Error fetching roles:', err)
        }
    }

    const fetchApiTemplates = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/api-templates`)

            if (!response.ok) {
                throw new Error('Failed to fetch API templates')
            }

            const data = await response.json()
            // Transform backend data to match frontend ApiTemplate interface
            const templates = data.map((template: any) => ({
                api_type: template.api_type,
                label: template.label,
                description: template.description,
                value: template.field_schema
            }))
            setApiTemplates(templates)
        } catch (err: any) {
            console.error('Error fetching API templates:', err)
        }
    }

    const handleSettingUpdate = async (key: string, value: Record<string, any>, isActive: boolean) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/settings/${key}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value, is_active: isActive }),
            })

            if (!response.ok) {
                throw new Error('Failed to update setting')
            }

            // Refresh settings
            await fetchSettings()
        } catch (err: any) {
            console.error('Error updating setting:', err)
            throw err
        }
    }

    const handleTestConnection = async (key: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/settings/${key}/test`, {
                method: 'POST',
            })

            const data = await response.json()
            return data
        } catch (err: any) {
            console.error('Error testing connection:', err)
            return { success: false, message: 'Failed to test connection' }
        }
    }

    const handleSelectTemplate = (template: ApiTemplate) => {
        setSelectedTemplate(template)
        setFormData(template.value)
        setInstanceName('')
    }

    const handleFormFieldChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSaveAPI = async () => {
        if (!selectedTemplate) return

        try {
            setIsSaving(true)
            const response = await fetch(`http://localhost:3001/api/v1/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_type: selectedTemplate.api_type,
                    instance_name: instanceName || undefined,
                    category: 'api_integration',
                    label: instanceName ? `${selectedTemplate.label} - ${instanceName}` : selectedTemplate.label,
                    description: selectedTemplate.description,
                    value: formData,
                    is_encrypted: true,
                    is_active: true // Set to active immediately
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create API integration')
            }

            // Reset form
            setSelectedTemplate(null)
            setInstanceName('')
            setFormData({})
            await fetchSettings()
        } catch (err: any) {
            console.error('Error creating API:', err)
            alert('Failed to create API integration: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelForm = () => {
        setSelectedTemplate(null)
        setInstanceName('')
        setFormData({})
    }

    const handleDeleteAPI = async (key: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/settings/${key}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete API integration')
            }

            await fetchSettings()
        } catch (err: any) {
            console.error('Error deleting API:', err)
            throw err
        }
    }

    // All templates are always available since we support multiple instances
    const availableTemplates = apiTemplates

    const handleUpdateRole = async (id: string, data: Partial<any>) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/roles/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to update role')
            }

            // Refresh roles
            await fetchRoles()
        } catch (err: any) {
            console.error('Error updating role:', err)
            throw err
        }
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--neutral-100)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SettingsHeader
                    activeTab={activeTab}
                    hasSettings={settings.length > 0}
                    onAddClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />

                <SettingsTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--red-50)', color: 'var(--red-700)' }}>
                        <p className="font-medium">Error loading settings</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'api' && (
                            <ApiIntegrationsContent
                                settings={settings}
                                availableTemplates={availableTemplates}
                                selectedTemplate={selectedTemplate}
                                instanceName={instanceName}
                                formData={formData}
                                isSaving={isSaving}
                                onSelectTemplate={handleSelectTemplate}
                                onInstanceNameChange={setInstanceName}
                                onFieldChange={handleFormFieldChange}
                                onSave={handleSaveAPI}
                                onCancel={handleCancelForm}
                                onUpdate={handleSettingUpdate}
                                onTest={handleTestConnection}
                                onDelete={handleDeleteAPI}
                            />
                        )}

                        {activeTab === 'users' && (
                            <UsersContent
                                users={users}
                                roles={roles}
                                onRefresh={() => {
                                    fetchUsers()
                                    fetchRoles()
                                }}
                                onUpdateRole={handleUpdateRole}
                            />
                        )}

                        {activeTab === 'system' && (
                            <SystemContent
                                settings={settings}
                                onUpdateSetting={(key, value) => handleSettingUpdate(key, value, true)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
