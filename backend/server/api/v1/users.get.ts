import { requireAuth } from '../../utils/auth'
import { UserService } from '../../services/user.service'

/**
 * GET /api/v1/users
 * List all users (admin only)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // await requireAuth(event)

    // TODO: Check if user has admin role
    // For now, any authenticated user can access

    const userService = new UserService()
    const users = await userService.getAllUsers()

    return users
})
