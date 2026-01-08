import { CategoryService } from '../../../services/category.service'

/**
 * GET /api/v1/categories/:id
 * Get single category by ID (public)
 */
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Category ID is required'
        })
    }

    const categoryService = new CategoryService()
    const category = await categoryService.getCategoryById(id)

    return category
})
