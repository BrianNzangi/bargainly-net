import { requireAuth } from '../../../utils/auth'
import { ProductService } from '../../../services/product.service'
import type { UpdateProductInput } from '../../../../shared/types/database'

/**
 * PATCH /api/v1/products/:id
 * Update product (admin/editor)
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

    const body = await readBody(event) as UpdateProductInput

    const productService = new ProductService()
    const product = await productService.updateProduct(id, body)

    return product
})
