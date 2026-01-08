import { SettingService } from '../../services/setting.service'
import type { CreateSettingInput } from '../../../../shared/types/database'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event) as CreateSettingInput

        // Validate required fields
        if (!body.api_type || !body.category || !body.label) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: api_type, category, label'
            })
        }

        const service = new SettingService()
        const setting = await service.createSetting(body)

        return {
            success: true,
            data: setting,
            message: 'Setting created successfully'
        }
    } catch (error: any) {
        console.error('Error creating setting:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to create setting'
        })
    }
})
