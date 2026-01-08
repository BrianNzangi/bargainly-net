import { AnalyticsTemplateService } from '../../services/analytics-template.service'

/**
 * GET /api/v1/analytics-templates
 */
export default defineEventHandler(async (event) => {
    const service = new AnalyticsTemplateService()
    const templates = await service.getAllTemplates(true)
    return templates
})
