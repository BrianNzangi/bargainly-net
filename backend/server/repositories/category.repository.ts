import { BaseRepository } from './base.repository'
import type { Category } from '../../../shared/types/database'

/**
 * Category Repository
 * Handles all category data access operations
 */
export class CategoryRepository extends BaseRepository<Category> {
    constructor() {
        super('categories')
    }

    /**
     * Find category by slug
     */
    async findBySlug(slug: string): Promise<Category | null> {
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
                statusMessage: `Failed to find category by slug: ${error.message}`
            })
        }

        return data as Category
    }

    /**
     * Find root categories (no parent)
     */
    async findRootCategories(): Promise<Category[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .is('parent_id', null)
            .order('name')

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find root categories: ${error.message}`
            })
        }

        return data as Category[]
    }

    /**
     * Find child categories of a parent
     */
    async findChildren(parentId: string): Promise<Category[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('parent_id', parentId)
            .order('name')

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find child categories: ${error.message}`
            })
        }

        return data as Category[]
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
     * Get category hierarchy (category with all ancestors)
     */
    async getHierarchy(categoryId: string): Promise<Category[]> {
        const hierarchy: Category[] = []
        let currentId: string | null = categoryId

        while (currentId) {
            const category = await this.findById(currentId)
            if (!category) break

            hierarchy.unshift(category)
            currentId = category.parent_id || null
        }

        return hierarchy
    }
}
