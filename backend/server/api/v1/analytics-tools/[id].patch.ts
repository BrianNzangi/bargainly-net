import { AnalyticsToolService } from '../../../services/analytics-tool.service'

/**
 * PATCH /api/v1/analytics-tools/[id]
 */
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const service = new AnalyticsToolService()

    const tool = await service.upsertTool(id, body)
    return {
        success: true,
        data: tool
    }
})
