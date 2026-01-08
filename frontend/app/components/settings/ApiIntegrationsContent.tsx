'use client'

import ApiIntegrationCard from './ApiIntegrationCard'
import ApiSelectionGrid from './ApiSelectionGrid'
import ApiConfigurationForm from './ApiConfigurationForm'
import { ApiTemplate, Setting } from './types'

interface ApiIntegrationsContentProps {
    settings: Setting[]
    availableTemplates: ApiTemplate[]
    selectedTemplate: ApiTemplate | null
    instanceName: string
    formData: Record<string, any>
    isSaving: boolean
    onSelectTemplate: (template: ApiTemplate) => void
    onInstanceNameChange: (value: string) => void
    onFieldChange: (key: string, value: string) => void
    onSave: () => void
    onCancel: () => void
    onUpdate: (key: string, value: Record<string, any>, isActive: boolean) => Promise<void>
    onTest: (key: string) => Promise<{ success: boolean; message: string }>
    onDelete: (key: string) => Promise<void>
}

export default function ApiIntegrationsContent({
    settings,
    availableTemplates,
    selectedTemplate,
    instanceName,
    formData,
    isSaving,
    onSelectTemplate,
    onInstanceNameChange,
    onFieldChange,
    onSave,
    onCancel,
    onUpdate,
    onTest,
    onDelete
}: ApiIntegrationsContentProps) {
    if (settings.length === 0) {
        return (
            <div className="space-y-6">
                {!selectedTemplate ? (
                    <ApiSelectionGrid
                        templates={availableTemplates}
                        onSelectTemplate={onSelectTemplate}
                    />
                ) : (
                    <ApiConfigurationForm
                        template={selectedTemplate}
                        instanceName={instanceName}
                        formData={formData}
                        isSaving={isSaving}
                        onInstanceNameChange={onInstanceNameChange}
                        onFieldChange={onFieldChange}
                        onSave={onSave}
                        onCancel={onCancel}
                    />
                )}
            </div>
        )
    }

    return (
        <>
            {settings.map((setting) => (
                <ApiIntegrationCard
                    key={setting.id}
                    setting={setting}
                    onUpdate={onUpdate}
                    onTest={onTest}
                    onDelete={onDelete}
                />
            ))}
        </>
    )
}
