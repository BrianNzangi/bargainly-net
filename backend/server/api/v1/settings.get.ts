import { SettingService } from '../../services/setting.service'

export default defineEventHandler(async (event) => {
    try {
        // Get query parameters
        const query = getQuery(event)
        const category = query.category as string | undefined
        const unmask = query.unmask === 'true' // Allow unmasking for internal use

        const service = new SettingService()
        const settings = await service.getAllSettings(category, !unmask) // Mask if unmask is false

        return {
            success: true,
            data: settings,
            count: settings.length
        }
    } catch (error: any) {
        console.error('Error fetching settings:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch settings'
        })
    }
})
