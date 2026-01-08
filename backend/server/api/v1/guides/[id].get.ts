import { GuideService } from '../../../services/guide.service'

/**
 * GET /api/v1/guides/:id
 * Get single guide by ID
 */
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Guide ID is required'
        })
    }

    const guideService = new GuideService()
    const guide = await guideService.getGuideById(id)

    // If guide is not published, require authentication
    if (guide.status !== 'published') {
        const auth = getHeader(event, 'authorization')
        if (!auth) {
            throw createError({
                statusCode: 403,
                statusMessage: 'This guide is not published'
            })
        }
    }

    return guide
})
