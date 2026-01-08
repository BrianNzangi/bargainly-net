import { AnalyticsToolService } from '../../services/analytics-tool.service'

/**
 * POST /api/v1/analytics-tools
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const service = new AnalyticsToolService()

    // Validate body? Basic validation
    if (!body.template_id || !body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    const tool = await service.upsertTool(undefined, body)
    return {
        success: true,
        data: tool
    }
})
