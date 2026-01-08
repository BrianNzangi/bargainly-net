import { ProductRepository } from '../repositories/product.repository'
import type { Product, CreateProductInput, UpdateProductInput } from '../shared/types'

/**
 * Product Service
 * Business logic for product management
 */
export class ProductService {
    private productRepo: ProductRepository

    constructor() {
        this.productRepo = new ProductRepository()
    }

    /**
     * Get all products
     */
    async getAllProducts(includeAll = false): Promise<any[]> {
        return this.productRepo.findAllWithCategory()
    }

    /**
     * Get product by ID
     */
    async getProductById(id: string): Promise<Product> {
        const product = await this.productRepo.findById(id)

        if (!product) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Product not found'
            })
        }

        return product
    }

    /**
     * Get product by external_id and source
     */
    async getProductByExternalId(externalId: string, source: string): Promise<Product> {
        const product = await this.productRepo.findByExternalId(externalId, source)

        if (!product) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Product not found'
            })
        }

        return product
    }

    /**
     * Create a new product
     */
    async createProduct(input: CreateProductInput): Promise<Product> {
        // Validate external_id + source uniqueness
        const exists = await this.productRepo.externalIdExists(input.external_id, input.source)
        if (exists) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Product with this external_id and source already exists'
            })
        }

        // Validate prices if provided
        if (input.price_current !== undefined && input.price_current < 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Current price must be positive'
            })
        }

        if (input.price_original !== undefined && input.price_original < 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Original price must be positive'
            })
        }

        // Validate rating if provided
        if (input.rating !== undefined && (input.rating < 0 || input.rating > 5)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Rating must be between 0 and 5'
            })
        }

        // Set defaults
        const productData = {
            ...input,
            currency: input.currency || 'USD',
            availability: input.availability || 'unknown'
        }

        return this.productRepo.create(productData as any)
    }

    /**
     * Update product
     */
    async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
        // Check if product exists
        const exists = await this.productRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Product not found'
            })
        }

        // If external_id or source is being updated, check uniqueness
        if (input.external_id || input.source) {
            const product = await this.getProductById(id)
            const externalId = input.external_id || product.external_id
            const source = input.source || product.source

            const externalIdExists = await this.productRepo.externalIdExists(externalId, source, id)
            if (externalIdExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Product with this external_id and source already exists'
                })
            }
        }

        // Validate prices if provided
        if (input.price_current !== undefined && input.price_current < 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Current price must be positive'
            })
        }

        if (input.price_original !== undefined && input.price_original < 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Original price must be positive'
            })
        }

        // Validate rating if provided
        if (input.rating !== undefined && (input.rating < 0 || input.rating > 5)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Rating must be between 0 and 5'
            })
        }

        return this.productRepo.update(id, input)
    }

    /**
     * Delete product
     */
    async deleteProduct(id: string): Promise<void> {
        const exists = await this.productRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Product not found'
            })
        }

        await this.productRepo.delete(id)
    }

    /**
     * Get products by source
     */
    async getProductsBySource(source: string): Promise<Product[]> {
        return this.productRepo.findBySource(source)
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(category: string): Promise<Product[]> {
        return this.productRepo.findByCategory(category)
    }

    /**
     * Get products by brand
     */
    async getProductsByBrand(brand: string): Promise<Product[]> {
        return this.productRepo.findByBrand(brand)
    }

    /**
     * Get products by price range
     */
    async getProductsByPriceRange(minPrice?: number, maxPrice?: number): Promise<Product[]> {
        return this.productRepo.findByPriceRange(minPrice, maxPrice)
    }
}
