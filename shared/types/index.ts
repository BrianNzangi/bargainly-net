export interface Product {
    id: string
    name: string
    price: number
    sale_price?: number
    created_at: string
    updated_at?: string
    description?: string
    image_url?: string
    category?: string
    stock?: number
}

export interface User {
    id: string
    email: string
    name?: string
}

export interface AuthSession {
    user: User
    accessToken: string
}
