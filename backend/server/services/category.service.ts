import { CategoryRepository } from '../repositories/category.repository'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../../shared/types/database'

/**
 * Category Service
 * Business logic for category management
 */
export class CategoryService {
    private categoryRepo: CategoryRepository

    constructor() {
        this.categoryRepo = new CategoryRepository()
    }

    /**
     * Get all categories
     */
    async getAllCategories(): Promise<Category[]> {
        const result = await this.categoryRepo.findAll({}, { limit: 1000 })
        return result.data
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: string): Promise<Category> {
        const category = await this.categoryRepo.findById(id)

        if (!category) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Category not found'
            })
        }

        return category
    }

    /**
     * Get category by slug
     */
    async getCategoryBySlug(slug: string): Promise<Category> {
        const category = await this.categoryRepo.findBySlug(slug)

        if (!category) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Category not found'
            })
        }

        return category
    }

    /**
     * Create a new category
     */
    async createCategory(input: CreateCategoryInput): Promise<Category> {
        // Validate slug uniqueness
        const slugExists = await this.categoryRepo.slugExists(input.slug)
        if (slugExists) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Slug already exists'
            })
        }

        // If parent_id is provided, validate it exists
        if (input.parent_id) {
            const parentExists = await this.categoryRepo.exists(input.parent_id)
            if (!parentExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Parent category not found'
                })
            }
        }

        return this.categoryRepo.create(input)
    }

    /**
     * Update category
     */
    async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
        // Check if category exists
        const exists = await this.categoryRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Category not found'
            })
        }

        // If slug is being updated, check uniqueness
        if (input.slug) {
            const slugExists = await this.categoryRepo.slugExists(input.slug, id)
            if (slugExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Slug already exists'
                })
            }
        }

        // If parent_id is being updated, validate
        if (input.parent_id) {
            // Prevent self-reference
            if (input.parent_id === id) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Category cannot be its own parent'
                })
            }

            // Check parent exists
            const parentExists = await this.categoryRepo.exists(input.parent_id)
            if (!parentExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Parent category not found'
                })
            }

            // Prevent circular reference
            const parentHierarchy = await this.categoryRepo.getHierarchy(input.parent_id)
            if (parentHierarchy.some(cat => cat.id === id)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Circular reference detected'
                })
            }
        }

        return this.categoryRepo.update(id, input)
    }

    /**
     * Delete category
     */
    async deleteCategory(id: string): Promise<void> {
        const exists = await this.categoryRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Category not found'
            })
        }

        // Check if category has children
        const children = await this.categoryRepo.findChildren(id)
        if (children.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot delete category with child categories'
            })
        }

        await this.categoryRepo.delete(id)
    }

    /**
     * Get root categories
     */
    async getRootCategories(): Promise<Category[]> {
        return this.categoryRepo.findRootCategories()
    }

    /**
     * Get child categories
     */
    async getChildCategories(parentId: string): Promise<Category[]> {
        return this.categoryRepo.findChildren(parentId)
    }

    /**
     * Get category hierarchy
     */
    async getCategoryHierarchy(categoryId: string): Promise<Category[]> {
        return this.categoryRepo.getHierarchy(categoryId)
    }

    /**
     * Generate unique slug from name
     */
    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }
}
