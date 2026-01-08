'use client'

import { ApiTemplate } from './types'

interface ApiConfigurationFormProps {
    template: ApiTemplate
    instanceName: string
    formData: Record<string, any>
    isSaving: boolean
    onInstanceNameChange: (value: string) => void
    onFieldChange: (key: string, value: string) => void
    onSave: () => void
    onCancel: () => void
}

export default function ApiConfigurationForm({
    template,
    instanceName,
    formData,
    isSaving,
    onInstanceNameChange,
    onFieldChange,
    onSave,
    onCancel
}: ApiConfigurationFormProps) {
    return (
        <div className="rounded-lg border" style={{ backgroundColor: 'var(--neutral-50)', borderColor: 'var(--neutral-300)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--neutral-900)' }}>
                    Configure {template.label}
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--neutral-600)' }}>
                    {template.description}
                </p>
            </div>

            <div className="p-6 space-y-4">
                {/* Instance Name */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neutral-700)' }}>
                        Instance Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={instanceName}
                        onChange={(e) => onInstanceNameChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: 'var(--neutral-300)', color: 'var(--neutral-900)' }}
                        placeholder="e.g., Production, Testing, US Store"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
                        Helps you identify multiple instances of the same API
                    </p>
                </div>

                {/* API Credentials */}
                {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neutral-700)' }}>
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </label>
                        <input
                            type={key.includes('secret') || key.includes('key') || key.includes('token') ? 'password' : 'text'}
                            value={value as string}
                            onChange={(e) => onFieldChange(key, e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderColor: 'var(--neutral-300)', color: 'var(--neutral-900)' }}
                            placeholder={`Enter ${key}`}
                        />
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                        style={{ borderColor: 'var(--neutral-300)', color: 'var(--neutral-700)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-md text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50"
                        style={{ backgroundColor: 'var(--accent)' }}
                    >
                        {isSaving ? 'Saving...' : 'Save & Activate'}
                    </button>
                </div>
            </div>
        </div>
    )
}
