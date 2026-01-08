import { GuideRepository } from '../../repositories/guide.repository'

/**
 * GET /api/v1/guides
 * List guides (public: published only, auth: all)
 */
export default defineEventHandler(async (event) => {
    const guideRepo = new GuideRepository()

    // Check if user is authenticated
    const auth = getHeader(event, 'authorization')
    const isAuthenticated = !!auth

    // Get Supabase client from repository
    const supabase = (guideRepo as any).getClient()

    // Build query
    let query = supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false })

    // If not authenticated, only show published guides
    if (!isAuthenticated) {
        query = query.eq('status', 'published')
    }

    const { data, error } = await query

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to fetch guides: ${error.message}`
        })
    }

    return data || []
})

