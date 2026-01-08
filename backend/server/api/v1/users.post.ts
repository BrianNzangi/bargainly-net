import { requireAuth } from '../../utils/auth'
import { UserService } from '../../services/user.service'
import type { CreateUserInput } from '../../../shared/types/database'

/**
 * POST /api/v1/users
 * Create a new user (admin only)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    await requireAuth(event)

    // TODO: Check if user has admin role

    const body = await readBody(event) as CreateUserInput

    const userService = new UserService()
    const user = await userService.createUser(body)

    return user
})
