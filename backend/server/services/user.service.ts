import { UserRepository } from '../repositories/user.repository'
import type { User, CreateUserInput, UpdateUserInput } from '../../../shared/types/database'

/**
 * User Service
 * Business logic for user management
 */
export class UserService {
    private userRepo: UserRepository

    constructor() {
        this.userRepo = new UserRepository()
    }

    /**
     * Get all users
     */
    async getAllUsers(): Promise<User[]> {
        const result = await this.userRepo.findAll()
        return result.data
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<User> {
        const user = await this.userRepo.findById(id)

        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            })
        }

        return user
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepo.findByEmail(email)
    }

    /**
     * Create a new user
     */
    async createUser(input: CreateUserInput): Promise<User> {
        // Validate email uniqueness
        const emailExists = await this.userRepo.emailExists(input.email)
        if (emailExists) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Email already exists'
            })
        }

        // Validate role
        const validRoles = ['ADMIN', 'EDITOR', 'VIEWER', 'MARKETING']
        if (!validRoles.includes(input.role)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid role'
            })
        }

        // Create user with defaults
        const userData = {
            ...input,
            is_enabled: input.is_enabled !== undefined ? input.is_enabled : true
        }

        return this.userRepo.create(userData)
    }

    /**
     * Update user
     */
    async updateUser(id: string, input: UpdateUserInput): Promise<User> {
        // Check if user exists
        const exists = await this.userRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            })
        }

        // If email is being updated, check uniqueness
        if (input.email) {
            const emailExists = await this.userRepo.emailExists(input.email, id)
            if (emailExists) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Email already exists'
                })
            }
        }

        // Validate role if provided
        if (input.role) {
            const validRoles = ['ADMIN', 'EDITOR', 'VIEWER', 'MARKETING']
            if (!validRoles.includes(input.role)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid role'
                })
            }
        }

        return this.userRepo.update(id, input)
    }

    /**
     * Delete user
     */
    async deleteUser(id: string): Promise<void> {
        const exists = await this.userRepo.exists(id)
        if (!exists) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            })
        }

        await this.userRepo.delete(id)
    }

    /**
     * Enable/disable user
     */
    async toggleUserStatus(id: string, isEnabled: boolean): Promise<User> {
        return this.updateUser(id, { is_enabled: isEnabled })
    }

    /**
     * Update last login
     */
    async recordLogin(id: string): Promise<void> {
        await this.userRepo.updateLastLogin(id)
    }

    /**
     * Get users by role
     */
    async getUsersByRole(role: string): Promise<User[]> {
        return this.userRepo.findByRole(role)
    }

    /**
     * Get enabled users only
     */
    async getEnabledUsers(): Promise<User[]> {
        return this.userRepo.findEnabled()
    }
}
