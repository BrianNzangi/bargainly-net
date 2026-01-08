import { requireAuth } from '../../utils/auth'
import { ProductService } from '../../services/product.service'
import type { CreateProductInput } from '../../../shared/types/database'

/**
 * POST /api/v1/products
 * Create a new product (admin/editor)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // TODO: Re-enable authentication once auth system is properly configured
    // await requireAuth(event)

    const body = await readBody(event) as CreateProductInput

    const productService = new ProductService()
    const product = await productService.createProduct(body)

    return product
})
