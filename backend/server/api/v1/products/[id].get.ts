import { ProductService } from '../../../services/product.service'

/**
 * GET /api/v1/products/:id
 * Get single product by ID
 */
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Product ID is required'
        })
    }

    const productService = new ProductService()
    const product = await productService.getProductById(id)

    return product
})
