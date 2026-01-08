import { jwtVerify } from 'jose'
import type { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
    const auth = getHeader(event, 'authorization')

    if (!auth) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Authorization header missing'
        })
    }

    const token = auth.replace('Bearer ', '')

    try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        const { payload } = await jwtVerify(token, secret)

        // Attach user data to event context
        event.context.user = {
            id: payload.sub as string
        }
    } catch (error) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid or expired token'
        })
    }
}
