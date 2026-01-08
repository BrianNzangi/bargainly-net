import { RoleService } from '../../../services/role.service'
import type { Role } from '../../../../shared/types'

export default defineEventHandler(async (event) => {
    // Require authentication
    // await requireAuth(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Role ID is required'
        })
    }

    try {
        const body = await readBody(event) as Partial<Role>
        const service = new RoleService()
        const role = await service.updateRole(id, body)

        return role
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to update role'
        })
    }
})
