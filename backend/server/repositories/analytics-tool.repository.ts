import { BaseRepository } from './base.repository'

export interface AnalyticsTool {
    id: string
    template_id: string
    name: string
    configuration: any
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined fields
    template?: {
        provider: string
        label: string
    }
}

export class AnalyticsToolRepository extends BaseRepository<AnalyticsTool> {
    constructor() {
        super('analytics_tools')
    }

    async findAllWithTemplate(): Promise<AnalyticsTool[]> {
        const supabase = this.getClient()
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, template:analytics_templates(provider, label)')
            .order('created_at', { ascending: false })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch analytics tools: ${error.message}`
            })
        }
        return data as AnalyticsTool[]
    }

    /*
     * Upsert an analytics tool
     */
    async upsert(id: string | undefined, data: Partial<AnalyticsTool>): Promise<AnalyticsTool> {
        const supabase = this.getClient()

        // If id is provided, it's an update, otherwise insert (let DB gen ID or use provided one)
        // Exclude 'template' from payload as it is a joined field
        const { template, ...rest } = data
        const payload = { ...rest, updated_at: new Date().toISOString() }
        if (id) {
            payload.id = id
        }

        const { data: result, error } = await supabase
            .from(this.tableName as any)
            .upsert(payload as any)
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to save analytics tool: ${error.message}`
            })
        }
        return result as AnalyticsTool
    }
}
