import { getSupabaseAdmin } from '../utils/supabase'
import type { ApiTemplate, CreateApiTemplateInput, UpdateApiTemplateInput } from '../shared/types'

export class ApiTemplateRepository {
    private getClient() {
        return getSupabaseAdmin()
    }

    async findAll(activeOnly: boolean = true): Promise<ApiTemplate[]> {
        const supabase = this.getClient()

        let query = supabase
            .from('api_templates')
            .select('*')
            .order('display_order', { ascending: true })

        if (activeOnly) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch API templates: ${error.message}`
            })
        }

        return data || []
    }

    async findById(id: string): Promise<ApiTemplate | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from('api_templates')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch API template: ${error.message}`
            })
        }

        return data
    }

    async findByApiType(apiType: string): Promise<ApiTemplate | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from('api_templates')
            .select('*')
            .eq('api_type', apiType)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch API template: ${error.message}`
            })
        }

        return data
    }

    async create(input: CreateApiTemplateInput): Promise<ApiTemplate> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from('api_templates')
            .insert({
                api_type: input.api_type,
                label: input.label,
                description: input.description || null,
                field_schema: input.field_schema,
                is_active: input.is_active ?? true,
                display_order: input.display_order ?? 0
            } as any)
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to create API template: ${error.message}`
            })
        }

        return data
    }

    async update(id: string, input: UpdateApiTemplateInput): Promise<ApiTemplate> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from('api_templates')
            .update(input as any)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to update API template: ${error.message}`
            })
        }

        return data
    }

    async delete(id: string): Promise<void> {
        const supabase = this.getClient()

        const { error } = await supabase
            .from('api_templates')
            .delete()
            .eq('id', id)

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to delete API template: ${error.message}`
            })
        }
    }
}
