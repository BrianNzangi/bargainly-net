import { requireAuth } from '../../../utils/auth'
import { GuideService } from '../../../services/guide.service'
import type { UpdateGuideInput } from '../../../../shared/types'

/**
 * PATCH /api/v1/guides/:id
 * Update guide (admin/editor/author)
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

    const body = await readBody(event) as UpdateGuideInput

    const guideService = new GuideService()
    const guide = await guideService.updateGuide(id, body)

    return guide
})
