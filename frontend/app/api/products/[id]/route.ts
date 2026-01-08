import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendAPI } from '@/lib/backend-api'

/**
 * GET /api/products/[id]
 * Fetch a single product by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await fetchBackendAPI(`/products/${params.id}`)

        return NextResponse.json(product, {
            headers: {
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
            },
        })
    } catch (error) {
        console.error(`Error fetching product ${params.id}:`, error)
        return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
        )
    }
}
