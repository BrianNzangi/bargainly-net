import { BaseRepository } from './base.repository'
import type { Product, ProductFilters } from '../shared/types'

/**
 * Product Repository
 * Handles all product data access operations
 */
export class ProductRepository extends BaseRepository<Product> {
    constructor() {
        super('products')
    }

    /**
     * Find all products with category information
     */
    async findAllWithCategory(): Promise<any[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                category:categories(id, name, slug)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch products with categories: ${error.message}`
            })
        }

        return data || []
    }

    /**
     * Find product by external_id and source
     */
    async findByExternalId(externalId: string, source: string): Promise<Product | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('external_id', externalId)
            .eq('source', source)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find product by external_id: ${error.message}`
            })
        }

        return data as Product
    }

    /**
     * Find products by source
     */
    async findBySource(source: string): Promise<Product[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('source', source)
            .order('created_at', { ascending: false })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find products by source: ${error.message}`
            })
        }

        return data as Product[]
    }

    /**
     * Find products by category (text field)
     */
    async findByCategory(category: string): Promise<Product[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find products by category: ${error.message}`
            })
        }

        return data as Product[]
    }

    /**
     * Find products by brand
     */
    async findByBrand(brand: string): Promise<Product[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('brand', brand)
            .order('created_at', { ascending: false })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find products by brand: ${error.message}`
            })
        }

        return data as Product[]
    }

    /**
     * Find products by price range
     */
    async findByPriceRange(minPrice?: number, maxPrice?: number): Promise<Product[]> {
        const supabase = this.getClient()

        let query = supabase.from(this.tableName).select('*')

        if (minPrice !== undefined) {
            query = query.gte('price_current', minPrice)
        }

        if (maxPrice !== undefined) {
            query = query.lte('price_current', maxPrice)
        }

        query = query.order('price_current', { ascending: true })

        const { data, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find products by price range: ${error.message}`
            })
        }

        return data as Product[]
    }

    /**
     * Find products with filters
     */
    async findWithFilters(filters?: ProductFilters): Promise<Product[]> {
        const supabase = this.getClient()

        let query = supabase.from(this.tableName).select('*')

        if (filters?.source) {
            query = query.eq('source', filters.source)
        }

        if (filters?.category) {
            query = query.eq('category', filters.category)
        }

        if (filters?.brand) {
            query = query.eq('brand', filters.brand)
        }

        if (filters?.affiliate_network) {
            query = query.eq('affiliate_network', filters.affiliate_network)
        }

        if (filters?.availability) {
            query = query.eq('availability', filters.availability)
        }

        if (filters?.min_price !== undefined) {
            query = query.gte('price_current', filters.min_price)
        }

        if (filters?.max_price !== undefined) {
            query = query.lte('price_current', filters.max_price)
        }

        query = query.order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find products with filters: ${error.message}`
            })
        }

        return data as Product[]
    }

    /**
     * Check if external_id + source combination exists
     */
    async externalIdExists(externalId: string, source: string, excludeId?: string): Promise<boolean> {
        const supabase = this.getClient()

        let query = supabase
            .from(this.tableName)
            .select('id', { count: 'exact', head: true })
            .eq('external_id', externalId)
            .eq('source', source)

        if (excludeId) {
            query = query.neq('id', excludeId)
        }

        const { count, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to check external_id existence: ${error.message}`
            })
        }

        return (count || 0) > 0
    }
}
