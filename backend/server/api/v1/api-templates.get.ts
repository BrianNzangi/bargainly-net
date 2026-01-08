import { requireAuth } from '../../utils/auth'
import { ApiTemplateService } from '../../services/api-template.service'

/**
 * GET /api/v1/api-templates
 * List all API templates
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // await requireAuth(event)

    const query = getQuery(event)
    const activeOnly = query.active_only !== 'false' // Default to true

    const service = new ApiTemplateService()
    const templates = await service.getAllTemplates(activeOnly)

    return templates
})
