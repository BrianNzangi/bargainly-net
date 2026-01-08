import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendAPI } from '@/lib/backend-api'

/**
 * GET /api/categories/[id]
 * Fetch a single category by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const category = await fetchBackendAPI(`/categories/${params.id}`)

        return NextResponse.json(category, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        })
    } catch (error) {
        console.error(`Error fetching category ${params.id}:`, error)
        return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
        )
    }
}
