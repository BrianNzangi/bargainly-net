import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendAPI } from '@/lib/backend-api'

/**
 * GET /api/guides/[slug]
 * Fetch a single published guide by slug
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        // Fetch all guides (published only, since no auth header)
        const guides = await fetchBackendAPI('/guides')

        // Find guide by slug
        const guide = guides.find((g: any) => g.slug === params.slug)

        if (!guide) {
            return NextResponse.json(
                { error: 'Guide not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(guide, {
            headers: {
                'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
            },
        })
    } catch (error) {
        console.error(`Error fetching guide ${params.slug}:`, error)
        return NextResponse.json(
            { error: 'Guide not found' },
            { status: 404 }
        )
    }
}
