import { requireAuth } from '../../../utils/auth'
import { UserService } from '../../../services/user.service'

/**
 * GET /api/v1/users/:id
 * Get single user by ID
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
    const user = await userService.getUserById(id)

    return user
})
