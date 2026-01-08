/**
 * Backend API Configuration
 * Server-side utility for Next.js API routes to communicate with the backend
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api/v1'

/**
 * Fetch wrapper for backend API calls
 * Only use this in Next.js API routes (server-side)
 */
export async function fetchBackendAPI(endpoint: string, options?: RequestInit) {
    const url = `${BACKEND_API_URL}${endpoint}`

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Backend API error (${response.status}): ${errorText}`)
        }

        return await response.json()
    } catch (error) {
        console.error(`Failed to fetch from backend: ${url}`, error)
        throw error
    }
}

/**
 * Get the backend API base URL
 */
export function getBackendAPIUrl() {
    return BACKEND_API_URL
}
