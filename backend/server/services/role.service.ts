import { RoleRepository } from '../repositories/role.repository'
import type { Role } from '../../shared/types/database'

export class RoleService {
    private repository: RoleRepository

    constructor() {
        this.repository = new RoleRepository()
    }

    async getAllRoles(): Promise<Role[]> {
        return await this.repository.findAll()
    }

    async getRoleByName(name: string): Promise<Role | null> {
        return await this.repository.findByName(name)
    }

    async getRoleById(id: string): Promise<Role | null> {
        return await this.repository.findById(id)
    }

    async updateRole(id: string, data: Partial<Role>): Promise<Role> {
        // Validate that name is not changed if it's a system role?
        // For now just pass through
        return await this.repository.update(id, data)
    }
}
