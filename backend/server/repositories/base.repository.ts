import { getSupabaseAdmin } from '../utils/supabase'
import type { PaginationParams, PaginatedResponse } from '../shared/types'

export interface QueryFilters {
    [key: string]: any
}

/**
 * Base Repository with common CRUD operations
 * All repositories extend this class
 */
export abstract class BaseRepository<T> {
    protected tableName: string

    constructor(tableName: string) {
        this.tableName = tableName
    }

    /**
     * Get Supabase client
     */
    protected getClient() {
        return getSupabaseAdmin()
    }

    /**
     * Find all records with optional filters and pagination
     */
    async findAll(
        filters?: QueryFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<T>> {
        const supabase = this.getClient()

        let query = supabase.from(this.tableName).select('*', { count: 'exact' })

        // Apply filters
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value)
                }
            })
        }

        // Apply sorting
        if (pagination?.sort_by) {
            query = query.order(pagination.sort_by, {
                ascending: pagination.sort_order === 'asc'
            })
        }

        // Apply pagination
        const page = pagination?.page || 1
        const limit = pagination?.limit || 10
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch ${this.tableName}: ${error.message}`
            })
        }

        return {
            data: data as T[],
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit)
            }
        }
    }

    /**
     * Find a single record by ID
     */
    async findById(id: string): Promise<T | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // Not found
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch ${this.tableName}: ${error.message}`
            })
        }

        return data as T
    }

    /**
     * Create a new record
     */
    async create(data: Partial<T>): Promise<T> {
        const supabase = this.getClient()

        const { data: created, error } = await supabase
            .from(this.tableName)
            .insert([data])
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to create ${this.tableName}: ${error.message}`
            })
        }

        return created as T
    }

    /**
     * Update an existing record
     */
    async update(id: string, data: Partial<T>): Promise<T> {
        const supabase = this.getClient()

        const { data: updated, error } = await supabase
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to update ${this.tableName}: ${error.message}`
            })
        }

        return updated as T
    }

    /**
     * Delete a record
     */
    async delete(id: string): Promise<void> {
        const supabase = this.getClient()

        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to delete ${this.tableName}: ${error.message}`
            })
        }
    }

    /**
     * Count records with optional filters
     */
    async count(filters?: QueryFilters): Promise<number> {
        const supabase = this.getClient()

        let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true })

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value)
                }
            })
        }

        const { count, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to count ${this.tableName}: ${error.message}`
            })
        }

        return count || 0
    }

    /**
     * Check if a record exists
     */
    async exists(id: string): Promise<boolean> {
        const record = await this.findById(id)
        return record !== null
    }
}
