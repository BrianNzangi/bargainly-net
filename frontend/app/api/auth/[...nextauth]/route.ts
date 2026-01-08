import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authOptions = {
    session: { strategy: 'jwt' as const },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                // TODO: Replace with your actual Supabase authentication logic
                // Example:
                // const { data, error } = await supabase.auth.signInWithPassword({
                //   email: credentials?.email,
                //   password: credentials?.password
                // })
                // if (error || !data.user) return null
                // return {
                //   id: data.user.id,
                //   email: data.user.email
                // }

                // Placeholder implementation
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                return {
                    id: 'user-id',
                    email: credentials.email
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.sub = user.id
            }
            return token
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = token.sub
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
