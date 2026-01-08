import { requireAuth } from '../../utils/auth'
import { RoleService } from '../../services/role.service'

/**
 * GET /api/v1/roles
 * List all roles
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    // await requireAuth(event)

    const roleService = new RoleService()
    const roles = await roleService.getAllRoles()

    return roles
})
