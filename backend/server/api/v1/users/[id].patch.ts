import { requireAuth } from '../../../utils/auth'
import { UserService } from '../../../services/user.service'
import type { UpdateUserInput } from '../../../../shared/types/database'

/**
 * PATCH /api/v1/users/:id
 * Update user (admin only)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    await requireAuth(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User ID is required'
        })
    }

    const body = await readBody(event) as UpdateUserInput

    const userService = new UserService()
    const user = await userService.updateUser(id, body)

    return user
})
