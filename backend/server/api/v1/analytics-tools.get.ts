import { AnalyticsToolService } from '../../services/analytics-tool.service'

/**
 * GET /api/v1/analytics-tools
 */
export default defineEventHandler(async (event) => {
    const service = new AnalyticsToolService()
    const tools = await service.getAllTools()
    return {
        success: true,
        data: tools
    }
})
