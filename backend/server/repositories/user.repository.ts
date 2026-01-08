import { BaseRepository } from './base.repository'
import type { User, UserFilters } from '../shared/types'

/**
 * User Repository
 * Handles all user data access operations
 */
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super('users')
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('email', email)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find user by email: ${error.message}`
            })
        }

        return data as User
    }

    /**
     * Find users by role
     */
    async findByRole(role: string): Promise<User[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('role', role)

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find users by role: ${error.message}`
            })
        }

        return data as User[]
    }

    /**
     * Find enabled users only
     */
    async findEnabled(): Promise<User[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('is_enabled', true)

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find enabled users: ${error.message}`
            })
        }

        return data as User[]
    }

    /**
     * Update last login timestamp
     */
    async updateLastLogin(id: string): Promise<void> {
        const supabase = this.getClient()

        const { error } = await supabase
            .from(this.tableName)
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to update last login: ${error.message}`
            })
        }
    }

    /**
     * Check if email is already taken
     */
    async emailExists(email: string, excludeId?: string): Promise<boolean> {
        const supabase = this.getClient()

        let query = supabase
            .from(this.tableName)
            .select('id', { count: 'exact', head: true })
            .eq('email', email)

        if (excludeId) {
            query = query.neq('id', excludeId)
        }

        const { count, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to check email existence: ${error.message}`
            })
        }

        return (count || 0) > 0
    }

    /**
     * Find users with filters
     */
    async findWithFilters(filters: UserFilters): Promise<User[]> {
        const supabase = this.getClient()

        let query = supabase.from(this.tableName).select('*')

        if (filters.role) {
            query = query.eq('role', filters.role)
        }

        if (filters.is_enabled !== undefined) {
            query = query.eq('is_enabled', filters.is_enabled)
        }

        if (filters.email) {
            query = query.ilike('email', `%${filters.email}%`)
        }

        const { data, error } = await query

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to find users with filters: ${error.message}`
            })
        }

        return data as User[]
    }
}
