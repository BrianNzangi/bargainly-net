// Re-export all types from database.ts
export * from './database'

// Additional types specific to auth
export interface AuthSession {
    user: User
    accessToken: string
}
