import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendAPI } from '@/lib/backend-api'

/**
 * GET /api/categories
 * Fetch all categories for public display
 */
export async function GET() {
    try {
        const categories = await fetchBackendAPI('/categories')

        return NextResponse.json(categories, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}
