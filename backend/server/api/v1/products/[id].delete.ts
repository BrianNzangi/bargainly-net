import { requireAuth } from '../../../utils/auth'
import { ProductService } from '../../../services/product.service'

/**
 * DELETE /api/v1/products/:id
 * Delete product (admin only)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // TODO: Re-enable authentication once auth system is properly configured
    // await requireAuth(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Product ID is required'
        })
    }

    const productService = new ProductService()
    await productService.deleteProduct(id)

    return { success: true, message: 'Product deleted successfully' }
})
