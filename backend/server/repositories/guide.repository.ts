import { BaseRepository } from './base.repository'
import type { Guide, GuideWithAuthor, GuideWithCategory, GuideFilters } from '../../../shared/types/database'

/**
 * Guide Repository
 * Handles all guide data access operations
 */
export class GuideRepository extends BaseRepository<Guide> {
    constructor() {
        super('guides')
    }

    /**
     * Find guide by slug
     */
    async findBySlug(slug: string): Promise<Guide | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('slug', slug)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find guide by slug: ${error.message}`
            })
        }

        return data as Guide
    }

    /**
     * Find guides by status
     */
    async findByStatus(status: string): Promise<Guide[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find guides by status: ${error.message}`
            })
        }

        return data as Guide[]
    }

    /**
     * Find guides by author
     */
    async findByAuthor(authorId: string): Promise<Guide[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('author_id', authorId)
            .order('created_at', { ascending: false })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find guides by author: ${error.message}`
            })
        }

        return data as Guide[]
    }

    /**
     * Find guides with author details
     */
    async findWithAuthor(filters?: GuideFilters): Promise<GuideWithAuthor[]> {
        const supabase = this.getClient()

        let query = supabase
            .from(this.tableName)
            .select(`
        *,
        author:users!author_id(id, name, email, image)
      `)

        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        if (filters?.author_id) {
            query = query.eq('author_id', filters.author_id)
        }

        if (filters?.category_id) {
            query = query.eq('category_id', filters.category_id)
        }

        query = query.order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find guides with author: ${error.message}`
            })
        }

        return data as GuideWithAuthor[]
    }

    /**
     * Find guides with category details
     */
    async findWithCategory(filters?: GuideFilters): Promise<GuideWithCategory[]> {
        const supabase = this.getClient()

        let query = supabase
            .from(this.tableName)
            .select(`
        *,
        category:categories!category_id(id, name, slug)
      `)

        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        if (filters?.category_id) {
            query = query.eq('category_id', filters.category_id)
        }

        query = query.order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find guides with category: ${error.message}`
            })
        }

        return data as GuideWithCategory[]
    }

    /**
     * Check if slug is already taken
     */
    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        const supabase = this.getClient()

        let query = supabase
            .from(this.tableName)
            .select('id', { count: 'exact', head: true })
            .eq('slug', slug)

        if (excludeId) {
            query = query.neq('id', excludeId)
        }

        const { count, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to check slug existence: ${error.message}`
            })
        }

        return (count || 0) > 0
    }

    /**
     * Find published guides only
     */
    async findPublished(): Promise<Guide[]> {
        return this.findByStatus('published')
    }
}
