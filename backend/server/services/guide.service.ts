import { GuideRepository } from '../repositories/guide.repository'
import { UserRepository } from '../repositories/user.repository'
import { CategoryRepository } from '../repositories/category.repository'
import type { Guide, CreateGuideInput, UpdateGuideInput, GuideWithAuthor } from '../shared/types'

/**
 * Guide Service
 * Business logic for guide management
 */
export class GuideService {
    private guideRepo: GuideRepository
    private userRepo: UserRepository
    private categoryRepo: CategoryRepository

    constructor() {
        this.guideRepo = new GuideRepository()
        this.userRepo = new UserRepository()
        this.categoryRepo = new CategoryRepository()
    }

    /**
     * Get all guides
     */
    async getAllGuides(includeUnpublished = false): Promise<GuideWithAuthor[]> {
        if (includeUnpublished) {
            return this.guideRepo.findWithAuthor()
        }
        return this.guideRepo.findWithAuthor({ status: 'published' })
    }

    /**
     * Get guide by ID
     */
    async getGuideById(id: string): Promise<Guide> {
        const guide = await this.guideRepo.findById(id)

        if (!guide) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Guide not found'
            })
        }

        return guide
    }

    /**
     * Get guide by slug
     */
    async getGuideBySlug(slug: string): Promise<Guide> {
        const guide = await this.guideRepo.findBySlug(slug)

        if (!guide) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Guide not found'
            })
        }

        return guide
    }

    /**
     * Create a new guide
     */
    async createGuide(input: CreateGuideInput): Promise<Guide> {
        // Validate author exists (only if author_id is provided)
        if (input.author_id) {
            const authorExists = await this.userRepo.exists(input.author_id)
            if (!authorExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Author not found'
                })
            }
        }

        // Validate category if provided
        if (input.category_id) {
            const categoryExists = await this.categoryRepo.exists(input.category_id)
            if (!categoryExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Category not found'
                })
            }
        }

        // Validate slug uniqueness
        const slugExists = await this.guideRepo.slugExists(input.slug)
        if (slugExists) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Slug already exists'
            })
        }

        // Set defaults
        const guideData = {
            ...input,
            status: input.status || 'draft',
            published_at: input.status === 'published' ? new Date().toISOString() : null
        }

        return this.guideRepo.create(guideData)
    }

    /**
     * Update guide
     */
    async updateGuide(id: string, input: UpdateGuideInput): Promise<Guide> {
        // Check if guide exists
        const exists = await this.guideRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Guide not found'
            })
        }

        // If slug is being updated, check uniqueness
        if (input.slug) {
            const slugExists = await this.guideRepo.slugExists(input.slug, id)
            if (slugExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Slug already exists'
                })
            }
        }

        // If category is being updated, validate
        if (input.category_id) {
            const categoryExists = await this.categoryRepo.exists(input.category_id)
            if (!categoryExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Category not found'
                })
            }
        }

        // If status is changing to published, set published_at
        if (input.status === 'published' && !input.published_at) {
            input.published_at = new Date().toISOString()
        }

        return this.guideRepo.update(id, input)
    }

    /**
     * Delete guide
     */
    async deleteGuide(id: string): Promise<void> {
        const exists = await this.guideRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Guide not found'
            })
        }

        await this.guideRepo.delete(id)
    }

    /**
     * Publish guide
     */
    async publishGuide(id: string): Promise<Guide> {
        return this.updateGuide(id, {
            status: 'published',
            published_at: new Date().toISOString()
        })
    }

    /**
     * Unpublish guide (set to draft)
     */
    async unpublishGuide(id: string): Promise<Guide> {
        return this.updateGuide(id, { status: 'draft' })
    }

    /**
     * Get guides by author
     */
    async getGuidesByAuthor(authorId: string): Promise<Guide[]> {
        return this.guideRepo.findByAuthor(authorId)
    }

    /**
     * Get published guides only
     */
    async getPublishedGuides(): Promise<Guide[]> {
        return this.guideRepo.findPublished()
    }

    /**
     * Generate unique slug from title
     */
    generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }
}
