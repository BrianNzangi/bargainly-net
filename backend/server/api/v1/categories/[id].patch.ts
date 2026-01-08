import { requireAuth } from '../../../utils/auth'
import { CategoryService } from '../../../services/category.service'
import type { UpdateCategoryInput } from '../../../../shared/types'

/**
 * PATCH /api/v1/categories/:id
 * Update category (admin/editor)
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

    const body = await readBody(event) as UpdateCategoryInput

    const categoryService = new CategoryService()
    const category = await categoryService.updateCategory(id, body)

    return category
})
