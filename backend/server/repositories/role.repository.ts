import { getSupabaseAdmin } from '../utils/supabase'
import type { Role } from '../shared/types'

export class RoleRepository {
    private getClient() {
        return getSupabaseAdmin()
    }

    async findAll(): Promise<Role[]> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch roles: ${error.message}`
            })
        }

        return data || []
    }

    async findById(id: string): Promise<Role | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch role: ${error.message}`
            })
        }

        return data
    }

    async findByName(name: string): Promise<Role | null> {
        const supabase = this.getClient()

        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .eq('name', name)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch role: ${error.message}`
            })
        }

        return data
    }

    async update(id: string, data: Partial<Role>): Promise<Role> {
        const supabase = this.getClient()

        const { data: updated, error } = await supabase
            .from('roles')
            .update(data as any)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to update role: ${error.message}`
            })
        }

        return updated
    }
}
