import { ProductService } from '../../services/product.service'
import { CategoryService } from '../../services/category.service'

/**
 * GET /api/v1/products
 * List products (public: active only, auth: all)
 * Query params: search, category
 */
export default defineEventHandler(async (event) => {
    const productService = new ProductService()
    const categoryService = new CategoryService()

    // Check if user is authenticated
    const auth = getHeader(event, 'authorization')
    const isAuthenticated = !!auth

    // Get query parameters
    const query = getQuery(event)
    const searchTerm = query.search as string | undefined
    const categoryName = query.category as string | undefined

    // Get all products first
    let products = await productService.getAllProducts(isAuthenticated)

    // Apply search filter
    if (searchTerm) {
        const search = searchTerm.toLowerCase()
        products = products.filter(product =>
            product.title?.toLowerCase().includes(search) ||
            product.brand?.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search)
        )
    }

    // Apply category filter (including subcategories)
    if (categoryName) {
        // Get all categories
        const allCategories = await categoryService.getAllCategories()

        // Find the selected category
        const selectedCategory = allCategories.find(cat => cat.name === categoryName)

        if (selectedCategory) {
            // If it's a level 1 category (no parent), include all its level 2 children
            if (!selectedCategory.parent_id) {
                const childCategories = allCategories
                    .filter(cat => cat.parent_id === selectedCategory.id)
                    .map(cat => cat.name)

                // Filter products that match the parent category or any child category
                products = products.filter(product =>
                    product.category?.name === categoryName ||
                    (product.category?.name && childCategories.includes(product.category.name))
                )
            } else {
                // If it's a level 2 category, just filter by exact match
                products = products.filter(product =>
                    product.category?.name === categoryName
                )
            }
        }
    }

    return products
})
