import { requireAuth } from '../../../utils/auth'
import { UserService } from '../../../services/user.service'

/**
 * DELETE /api/v1/users/:id
 * Delete user (admin only)
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

    const userService = new UserService()
    await userService.deleteUser(id)

    return { success: true, message: 'User deleted successfully' }
})
