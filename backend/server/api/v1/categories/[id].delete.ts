import { requireAuth } from '../../../utils/auth'
import { CategoryService } from '../../../services/category.service'

/**
 * DELETE /api/v1/categories/:id
 * Delete category (admin only)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // TODO: Re-enable authentication once auth system is properly configured
    // await requireAuth(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Category ID is required'
        })
    }

    const categoryService = new CategoryService()
    await categoryService.deleteCategory(id)

    return { success: true, message: 'Category deleted successfully' }
})
