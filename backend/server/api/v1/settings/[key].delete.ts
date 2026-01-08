import { SettingService } from '../../../services/setting.service'

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
        await service.deleteSetting(key)

        return {
            success: true,
            message: 'Setting deleted successfully'
        }
    } catch (error: any) {
        console.error('Error deleting setting:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to delete setting'
        })
    }
})
