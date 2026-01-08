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
        const setting = await service.getSettingByKey(key, true)

        if (!setting) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Setting not found'
            })
        }

        return {
            success: true,
            data: setting
        }
    } catch (error: any) {
        console.error('Error fetching setting:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch setting'
        })
    }
})
