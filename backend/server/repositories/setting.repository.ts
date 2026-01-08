import { BaseRepository } from './base.repository'
import type { Setting, CreateSettingInput, UpdateSettingInput, SettingFilters } from '../shared/types'

/**
 * Repository for managing application settings
 */
export class SettingRepository extends BaseRepository<Setting> {
    constructor() {
        super('settings')
    }

    /**
     * Find a setting by its unique key
     */
    async findByKey(key: string): Promise<Setting | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('key', key)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // Not found
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch setting: ${error.message}`
            })
        }

        return data as Setting
    }

    /**
     * Find all settings by category
     */
    async findByCategory(category: string): Promise<Setting[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('category', category)
            .order('label', { ascending: true })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch settings by category: ${error.message}`
            })
        }

        return data as Setting[]
    }

    /**
     * Upsert a setting (create or update by key)
     */
    async upsert(key: string, value: Record<string, any>, additionalData?: Partial<Setting>): Promise<Setting> {
        const supabase = this.getClient()

        const settingData = {
            key,
            value,
            ...additionalData,
            updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .upsert(settingData, { onConflict: 'key' })
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to upsert setting: ${error.message}`
            })
        }

        return data as Setting
    }

    /**
     * Find all active settings, optionally filtered by category
     */
    async findActive(category?: string): Promise<Setting[]> {
        const supabase = this.getClient()

        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('is_active', true)

        if (category) {
            query = query.eq('category', category)
        }

        query = query.order('label', { ascending: true })

        const { data, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch active settings: ${error.message}`
            })
        }

        return data as Setting[]
    }

    /**
     * Update setting value by key
     */
    async updateByKey(key: string, updates: UpdateSettingInput): Promise<Setting> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('key', key)
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to update setting: ${error.message}`
            })
        }

        return data as Setting
    }

    /**
     * Delete setting by key
     */
    async deleteByKey(key: string): Promise<void> {
        const supabase = this.getClient()

        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('key', key)

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to delete setting: ${error.message}`
            })
        }
    }
}
