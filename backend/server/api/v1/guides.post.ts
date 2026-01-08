import { requireAuth } from '../../utils/auth'
import { GuideService } from '../../services/guide.service'
import type { CreateGuideInput } from '../../../shared/types/database'

/**
 * POST /api/v1/guides
 * Create a new guide (admin/editor)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // await requireAuth(event)

    const body = await readBody(event) as CreateGuideInput

    const guideService = new GuideService()
    const guide = await guideService.createGuide(body)

    return guide
})
