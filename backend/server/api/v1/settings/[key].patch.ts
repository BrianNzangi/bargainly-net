import { SettingService } from '../../../services/setting.service'
import type { UpdateSettingInput } from '../../../../../shared/types'

export default defineEventHandler(async (event) => {
    try {
        const key = getRouterParam(event, 'key')

        if (!key) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Setting key is required'
            })
        }

        const body = await readBody(event) as UpdateSettingInput

        const service = new SettingService()
        const setting = await service.updateSetting(key, body)

        return {
            success: true,
            data: setting,
            message: 'Setting updated successfully'
        }
    } catch (error: any) {
        console.error('Error updating setting:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to update setting'
        })
    }
})
