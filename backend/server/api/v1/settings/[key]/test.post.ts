import { SettingService } from '../../../../services/setting.service'

export default defineEventHandler(async (event) => {
    try {
        const key = getRouterParam(event, 'key')

        if (!key) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Setting key is required'
            })
        }

        const service = new SettingService()
        const result = await service.testConnection(key)

        return {
            success: result.success,
            message: result.message
        }
    } catch (error: any) {
        console.error('Error testing connection:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to test connection'
        })
    }
})
