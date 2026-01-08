import { requireAuth } from '../../utils/auth'
import { CategoryService } from '../../services/category.service'
import type { CreateCategoryInput } from '../shared/types'

/**
 * POST /api/v1/categories
 * Create a new category (admin/editor)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // TODO: Re-enable authentication once auth system is properly configured
    // await requireAuth(event)

    const body = await readBody(event) as CreateCategoryInput

    const categoryService = new CategoryService()
    const category = await categoryService.createCategory(body)

    return category
})
