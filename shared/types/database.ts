// Database Type Definitions
// Auto-generated from database schema inspection

/**
 * User Roles
 */
export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER' | 'MARKETING';

/**
 * Permission format: "resource:action"
 */
export type Permission = string;

/**
 * Publication status for guides
 */
export type PublicationStatus = 'draft' | 'published' | 'archived';

/**
 * Role Definition
 */
export interface Role {
    id: string;
    name: UserRole;
    description: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

/**
 * User Account
 */
export interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: UserRole;
    created_at: string;
    last_login_at?: string | null;
    is_enabled: boolean;
}

/**
 * Category
 */
export interface Category {
    id: string;
    name: string;
    slug: string;
    meta_title?: string | null;
    meta_description?: string | null;
    keywords?: string | null;
    seo_content?: string | null;
    level: number;
    parent_id?: string | null;
    sort_order: number;
    image_url?: string | null;
    product_count: number;
    l2_categories?: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Shopping Guide / Review
 */
export interface Guide {
    id: string;
    title: string;
    slug: string;
    content: string;
    author_id: string;
    category_id?: string | null;
    status: PublicationStatus;
    featured_image?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
}

/**
 * Product
 */
export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    sale_price?: number | null;
    category_id?: string | null;
    image_url?: string | null;
    stock?: number;
    sku?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Guide with author details
 */
export interface GuideWithAuthor extends Guide {
    author: Pick<User, 'id' | 'name' | 'email' | 'image'>;
}

/**
 * Guide with category details
 */
export interface GuideWithCategory extends Guide {
    category: Pick<Category, 'id' | 'name' | 'slug'> | null;
}

/**
 * Product with category details
 */
export interface ProductWithCategory extends Product {
    category: Pick<Category, 'id' | 'name' | 'slug'> | null;
}

/**
 * User with role details
 */
export interface UserWithRole extends User {
    role_details: Role;
}

/**
 * Input types for creating new records
 */
export interface CreateUserInput {
    email: string;
    name: string;
    role: UserRole;
    image?: string;
    is_enabled?: boolean;
}

export interface CreateCategoryInput {
    name: string;
    slug: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string;
    seo_content?: string;
    level?: number;
    parent_id?: string;
    sort_order?: number;
    image_url?: string;
    product_count?: number;
    l2_categories?: string;
}

export interface CreateGuideInput {
    title: string;
    slug: string;
    content: string;
    author_id: string;
    category_id?: string;
    status?: PublicationStatus;
    featured_image?: string;
    meta_title?: string;
    meta_description?: string;
}

export interface CreateProductInput {
    name: string;
    slug: string;
    description?: string;
    price: number;
    sale_price?: number;
    category_id?: string;
    image_url?: string;
    stock?: number;
    sku?: string;
    is_active?: boolean;
}

/**
 * Update types (all fields optional except id)
 */
export type UpdateUserInput = Partial<Omit<User, 'id' | 'created_at'>>;
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'created_at'>>;
export type UpdateGuideInput = Partial<Omit<Guide, 'id' | 'created_at'>>;
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'created_at'>>;

/**
 * Query filters
 */
export interface UserFilters {
    role?: UserRole;
    is_enabled?: boolean;
    email?: string;
}

export interface GuideFilters {
    status?: PublicationStatus;
    author_id?: string;
    category_id?: string;
}

export interface ProductFilters {
    category_id?: string;
    is_active?: boolean;
    min_price?: number;
    max_price?: number;
}

/**
 * Setting Categories
 */
export type SettingCategory = 'api_integration' | 'system' | 'email' | 'payment' | 'storage' | 'other';

/**
 * Application Setting
 */
export interface Setting {
    id: string;
    key: string;
    category: SettingCategory;
    label: string;
    description?: string | null;
    value: Record<string, any>;
    is_encrypted: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Input types for settings
 */
export interface CreateSettingInput {
    key: string;
    category: SettingCategory;
    label: string;
    description?: string;
    value: Record<string, any>;
    is_encrypted?: boolean;
    is_active?: boolean;
}

export type UpdateSettingInput = Partial<Omit<Setting, 'id' | 'created_at' | 'key'>>;

export interface SettingFilters {
    category?: SettingCategory;
    is_active?: boolean;
    key?: string;
}

/**
 * Pagination
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}
