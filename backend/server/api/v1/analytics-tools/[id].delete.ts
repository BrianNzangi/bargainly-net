import { AnalyticsToolService } from '../../../services/analytics-tool.service'

/**
 * DELETE /api/v1/analytics-tools/[id]
 */
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const service = new AnalyticsToolService()

    await service.deleteTool(id as string)
    return {
        success: true
    }
})
