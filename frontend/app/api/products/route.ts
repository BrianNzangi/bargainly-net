import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendAPI } from '@/lib/backend-api'

/**
 * GET /api/products
 * Fetch products for public display
 * Query params: ?search=term&category=name (optional)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search')
        const category = searchParams.get('category')

        // Build query string for backend
        const queryParts: string[] = []
        if (search) queryParts.push(`search=${encodeURIComponent(search)}`)
        if (category) queryParts.push(`category=${encodeURIComponent(category)}`)

        const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''

        // Fetch products from backend
        const products = await fetchBackendAPI(`/products${queryString}`)

        return NextResponse.json(products, {
            headers: {
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
            },
        })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
