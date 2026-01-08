import { CategoryService } from '../../services/category.service'

/**
 * GET /api/v1/categories
 * List all categories (public)
 */
export default defineEventHandler(async (event) => {
    const categoryService = new CategoryService()
    const categories = await categoryService.getAllCategories()

    return categories
})
