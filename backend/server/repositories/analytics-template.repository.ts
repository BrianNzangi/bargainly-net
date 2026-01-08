import { BaseRepository } from './base.repository'

export interface AnalyticsTemplate {
    id: string
    provider: string
    label: string
    description: string
    field_schema: any
    is_active: boolean
    display_order: number
    created_at: string
    updated_at: string
}

export class AnalyticsTemplateRepository extends BaseRepository<AnalyticsTemplate> {
    constructor() {
        super('analytics_templates')
    }

    async findAllActive(): Promise<AnalyticsTemplate[]> {
        const supabase = this.getClient()
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch analytics templates: ${error.message}`
            })
        }
        return data as AnalyticsTemplate[]
    }
}
