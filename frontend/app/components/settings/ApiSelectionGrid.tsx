'use client'

import { ApiTemplate } from './types'

interface ApiSelectionGridProps {
    templates: ApiTemplate[]
    onSelectTemplate: (template: ApiTemplate) => void
}

export default function ApiSelectionGrid({ templates, onSelectTemplate }: ApiSelectionGridProps) {
    return (
        <div className="space-y-6">
            <div className="text-center font-semibold text-lg py-8" style={{ color: 'var(--neutral-500)' }}>
                <p>No API integrations configured yet.</p>
                <p className="text-sm mt-2 font-normal">Select an API type below to get started</p>
            </div>

            {/* API Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                    <button
                        key={template.api_type}
                        onClick={() => onSelectTemplate(template)}
                        className="text-left p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                        style={{ borderColor: 'var(--neutral-300)' }}
                    >
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--neutral-900)' }}>
                            {template.label}
                        </h3>
                        <p className="text-sm mt-2" style={{ color: 'var(--neutral-600)' }}>
                            {template.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
