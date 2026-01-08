'use client'

import { useState, useEffect } from 'react'
import { Setting, AnalyticsTemplate, AnalyticsTool } from './types'
import ApiSelectionGrid from './ApiSelectionGrid'
import ApiConfigurationForm from './ApiConfigurationForm'
import { TrashBinMinimalistic, Pen, CheckCircle, DangerCircle, Restart, AddCircle } from '@solar-icons/react'

// Reuse ApiSelectionGrid and ApiConfigurationForm for analytics tools ?
// Or create generic ones? 
// For now, I'll adapt the existing generic components which take "templates" and "formData".

interface SystemContentProps {
    settings: Setting[] // For Generic System Settings (Bargainly Data)
    onUpdateSetting: (key: string, value: Record<string, any>) => Promise<void>
}

export default function SystemContent({ settings, onUpdateSetting }: SystemContentProps) {
    // --- State for Analytic Tools ---
    const [analyticsTemplates, setAnalyticsTemplates] = useState<AnalyticsTemplate[]>([])
    const [analyticsTools, setAnalyticsTools] = useState<AnalyticsTool[]>([])
    const [loadingAnalytics, setLoadingAnalytics] = useState(false)
    const [isSavingTool, setIsSavingTool] = useState(false)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<AnalyticsTemplate | null>(null)
    const [toolName, setToolName] = useState('')
    const [toolFormData, setToolFormData] = useState<Record<string, any>>({})

    // Edit mode for tools
    const [editingTool, setEditingTool] = useState<AnalyticsTool | null>(null)

    // --- State for System Settings (Bargainly Data) ---
    // Extract "general_site_settings"
    const generalSettings = settings.find(s => s.key === 'general_site_settings')
    const [systemFormData, setSystemFormData] = useState<Record<string, any>>({})
    const [isSavingSystem, setIsSavingSystem] = useState(false)

    useEffect(() => {
        if (generalSettings) {
            setSystemFormData(generalSettings.value)
        }
    }, [generalSettings])

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        setLoadingAnalytics(true)
        try {
            const [paramsRes, toolsRes] = await Promise.all([
                fetch('http://localhost:3001/api/v1/analytics-templates'),
                fetch('http://localhost:3001/api/v1/analytics-tools')
            ])
            const templates = await paramsRes.json()
            const toolsData = await toolsRes.json()

            setAnalyticsTemplates(templates.data || [])
            setAnalyticsTools(toolsData.data || [])
        } catch (error) {
            console.error('Failed to fetch analytics', error)
        } finally {
            setLoadingAnalytics(false)
        }
    }

    // --- System Settings Handlers ---
    const handleSystemChange = (field: string, value: string) => {
        const parts = field.split('.')
        if (parts.length === 2 && parts[0] === 'social_links') {
            setSystemFormData(prev => ({
                ...prev,
                social_links: {
                    ...(prev.social_links || {}),
                    [parts[1]]: value
                }
            }))
        } else {
            setSystemFormData(prev => ({ ...prev, [field]: value }))
        }
    }

    const saveSystemSettings = async () => {
        if (!generalSettings) return
        setIsSavingSystem(true)
        try {
            await onUpdateSetting(generalSettings.key, systemFormData)
            alert('System settings saved successfully')
        } catch (error) {
            alert('Failed to save system settings')
        } finally {
            setIsSavingSystem(false)
        }
    }

    // --- Analytics Tool Handlers ---
    const handleSelectTemplate = (template: any) => {
        // template in ApiSelectionGrid matches ApiTemplate interface which has api_type
        // My AnalyticsTemplate has provider. I need to map or adapt.
        const t = template as AnalyticsTemplate
        setSelectedTemplate(t)
        setToolName(t.label) // Default name
        setToolFormData({})
    }

    const handleSaveTool = async () => {
        if (!selectedTemplate) return
        setIsSavingTool(true)
        try {
            const payload = {
                template_id: selectedTemplate.id,
                name: toolName,
                configuration: toolFormData,
                is_active: true
            }

            const url = editingTool
                ? `http://localhost:3001/api/v1/analytics-tools/${editingTool.id}`
                : 'http://localhost:3001/api/v1/analytics-tools'

            const method = editingTool ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('Failed to save tool')

            await fetchAnalytics()
            setSelectedTemplate(null)
            setEditingTool(null)
            setToolFormData({})
            setToolName('')
            setIsAddingNew(false)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsSavingTool(false)
        }
    }

    const handleDeleteTool = async (id: string) => {
        if (!confirm('Are you sure you want to remove this tool?')) return
        try {
            await fetch(`http://localhost:3001/api/v1/analytics-tools/${id}`, { method: 'DELETE' })
            fetchAnalytics()
        } catch (error) {
            console.error(error)
        }
    }

    const startEditTool = (tool: AnalyticsTool) => {
        const tmpl = analyticsTemplates.find(t => t.id === tool.template_id)
        if (tmpl) {
            setEditingTool(tool)
            setSelectedTemplate(tmpl)
            setToolName(tool.name)
            setToolFormData(tool.configuration)
            // Scroll to form?
        }
    }

    return (
        <div className="space-y-8">
            {/* --- Section 1: Bargainly Data --- */}
            <div className="bg-white rounded-lg shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Bargainly Data (General Settings)</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure core site information.</p>
                </div>
                <div className="px-4 py-5 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Site Name</label>
                            <input
                                type="text"
                                value={systemFormData.site_name || ''}
                                onChange={e => handleSystemChange('site_name', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                            <input
                                type="email"
                                value={systemFormData.contact_email || ''}
                                onChange={e => handleSystemChange('contact_email', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                            <input
                                type="text"
                                value={systemFormData.seo_title || ''}
                                onChange={e => handleSystemChange('seo_title', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        {/* Social Links */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
                            <input
                                type="text"
                                value={systemFormData.social_links?.facebook || ''}
                                onChange={e => handleSystemChange('social_links.facebook', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
                            <input
                                type="text"
                                value={systemFormData.social_links?.twitter || ''}
                                onChange={e => handleSystemChange('social_links.twitter', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                            <input
                                type="text"
                                value={systemFormData.social_links?.instagram || ''}
                                onChange={e => handleSystemChange('social_links.instagram', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={saveSystemSettings}
                            disabled={isSavingSystem}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSavingSystem ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Section 2: Analytic Tools --- */}
            <div className="bg-white rounded-lg shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Analytic Tools</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect to Google Analytics, Brevo, etc.</p>
                    </div>
                    {/* Add Button - Visible when showing List (Always, even if empty) */}
                    {!selectedTemplate && !isAddingNew && (
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <AddCircle className="mr-1.5 h-4 w-4" />
                            Add New Integration
                        </button>
                    )}
                    {/* Cancel Add Button - Visible when showing Grid */}
                    {!selectedTemplate && isAddingNew && (
                        <button
                            onClick={() => setIsAddingNew(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {/* View 1: List Existing Tools */}
                    {!selectedTemplate && !isAddingNew && analyticsTools.length > 0 && (
                        <div className="space-y-4">
                            {analyticsTools.map(tool => (
                                <div key={tool.id} className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                            {tool.template?.label.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{tool.name}</h4>
                                            <p className="text-xs text-gray-500">{tool.template?.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => startEditTool(tool)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                                            <Pen className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteTool(tool.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
                                            <TrashBinMinimalistic className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View 1b: Empty State */}
                    {!selectedTemplate && !isAddingNew && analyticsTools.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <DangerCircle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No tools configured</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new integration.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsAddingNew(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <AddCircle className="-ml-1 mr-2 h-5 w-5" />
                                    Add New Integration
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View 2: Add New Integration Grid */}
                    {!selectedTemplate && isAddingNew && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Select Integration Type</h4>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {analyticsTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template)}
                                        className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md cursor-pointer border border-gray-200 transition-all duration-200"
                                    >
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                <span className="text-xl font-bold">{template.label.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {template.label}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {template.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Explain if empty */}
                            {analyticsTemplates.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-8">No integration templates available.</p>
                            )}
                        </div>
                    )}

                    {/* Add / Edit Form */}
                    {selectedTemplate ? (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-medium text-gray-900">
                                    {editingTool ? `Edit ${selectedTemplate.label}` : `Configure ${selectedTemplate.label}`}
                                </h4>
                                <button onClick={() => { setSelectedTemplate(null); setEditingTool(null); setIsAddingNew(false); }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                            </div>

                            {/* Reusing Form Logic simplified */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={toolName}
                                        onChange={e => setToolName(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    />
                                </div>

                                {Object.entries(selectedTemplate.field_schema).map(([fieldKey, schema]: [string, any]) => (
                                    <div key={fieldKey}>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {schema.label || fieldKey}
                                            {schema.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={schema.type || 'text'}
                                            placeholder={schema.placeholder}
                                            value={toolFormData[fieldKey] || ''}
                                            onChange={e => setToolFormData(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                        />
                                    </div>
                                ))}

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => { setSelectedTemplate(null); setEditingTool(null); setIsAddingNew(false); }}
                                        className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveTool}
                                        disabled={isSavingTool}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {isSavingTool ? 'Saving...' : (editingTool ? 'Update Tool' : 'Add Tool')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // This block is now handled by the new logic above for "View 2: Add New Integration Grid"
                        // If analyticsTools.length === 0, it will show the grid by default.
                        // If analyticsTools.length > 0, it will show the list by default, and the grid when isAddingNew is true.
                        null
                    )}
                </div>
            </div>
        </div>
    )
}
