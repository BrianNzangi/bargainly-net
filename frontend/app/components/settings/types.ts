// Shared types for API Settings components

export interface ApiTemplate {
    api_type: string
    label: string
    description: string
    value: Record<string, any>
}

export interface Setting {
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

export interface AnalyticsTemplate {
    id: string
    provider: string
    label: string
    description: string
    field_schema: Record<string, any>
    is_active: boolean
}

export interface AnalyticsTool {
    id: string
    template_id: string
    name: string
    configuration: Record<string, any>
    is_active: boolean
    template?: {
        provider: string
        label: string
    }
}
