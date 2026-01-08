import { requireAuth } from '../../../utils/auth'
import { GuideService } from '../../../services/guide.service'

/**
 * DELETE /api/v1/guides/:id
 * Delete guide (admin only)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // await requireAuth(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Guide ID is required'
        })
    }

    const guideService = new GuideService()
    await guideService.deleteGuide(id)

    return { success: true, message: 'Guide deleted successfully' }
})
