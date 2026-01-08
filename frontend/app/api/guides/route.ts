import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendAPI } from '@/lib/backend-api'

/**
 * GET /api/guides
 * Fetch published guides for public display
 * Query params: ?category=slug (optional)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const categorySlug = searchParams.get('category')

        // Fetch all guides from backend (without auth = published only)
        const guides = await fetchBackendAPI('/guides')

        // Filter by category if provided
        let filteredGuides = guides
        if (categorySlug) {
            filteredGuides = guides.filter((guide: any) =>
                guide.category?.slug === categorySlug
            )
        }

        return NextResponse.json(filteredGuides, {
            headers: {
                'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
            },
        })
    } catch (error) {
        console.error('Error fetching guides:', error)
        return NextResponse.json(
            { error: 'Failed to fetch guides' },
            { status: 500 }
        )
    }
}
