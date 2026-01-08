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
 * Product Source Types
 */
export type ProductSource = 'canopy' | 'amazon' | 'awin' | 'cj' | 'rakuten' | 'impact' | 'manual';

/**
 * Affiliate Network Types
 */
export type AffiliateNetwork = 'amazon' | 'awin' | 'cj' | 'impact' | 'rakuten' | 'manual';

/**
 * Product Availability
 */
export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'unknown';

/**
 * Product
 */
export interface Product {
    id: string;
    source: ProductSource;
    external_id: string;
    title: string;
    brand?: string | null;
    category?: string | null;
    tags?: string[] | null;
    images?: any | null; // JSONB
    price_current?: number | null;
    price_original?: number | null;
    currency?: string | null;
    product_url?: string | null;
    affiliate_url?: string | null;
    affiliate_network?: AffiliateNetwork | null;
    availability?: ProductAvailability | null;
    rating?: number | null;
    total_ratings?: number | null;
    merchant_name?: string | null;
    merchant_logo?: string | null;
    created_at: string;
    updated_at: string;
    raw_json?: any | null; // JSONB
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
 * Product with category details (deprecated - category is now a text field)
 */
export interface ProductWithCategory extends Product {
    // Category is now a text field in the schema, not a relation
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
    source: ProductSource;
    external_id: string;
    title: string;
    brand?: string;
    category?: string;
    tags?: string[];
    images?: any; // JSONB
    price_current?: number;
    price_original?: number;
    currency?: string;
    product_url?: string;
    affiliate_url?: string;
    affiliate_network?: AffiliateNetwork;
    availability?: ProductAvailability;
    rating?: number;
    total_ratings?: number;
    merchant_name?: string;
    merchant_logo?: string;
    raw_json?: any; // JSONB
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
    source?: ProductSource;
    category?: string;
    brand?: string;
    affiliate_network?: AffiliateNetwork;
    availability?: ProductAvailability;
    min_price?: number;
    max_price?: number;
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

/**
 * Setting / API Integration
 */
export interface Setting {
    id: string;
    key: string;
    api_type?: string | null;
    instance_name?: string | null;
    category: string;
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
    key?: string; // Will be auto-generated if not provided
    api_type: string;
    instance_name?: string;
    category: string;
    label: string;
    description?: string;
    value: Record<string, any>;
    is_encrypted?: boolean;
    is_active?: boolean;
}

export type UpdateSettingInput = Partial<Omit<Setting, 'id' | 'created_at'>>;

export interface SettingFilters {
    category?: string;
    api_type?: string;
    is_active?: boolean;
}
/**
 * API Template
 */
export interface ApiTemplate {
    id: string;
    api_type: string;
    label: string;
    description?: string | null;
    field_schema: Record<string, any>;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * Input types for creating API templates
 */
export interface CreateApiTemplateInput {
    api_type: string;
    label: string;
    description?: string;
    field_schema: Record<string, any>;
    is_active?: boolean;
    display_order?: number;
}

/**
 * Input types for updating API templates
 */
export interface UpdateApiTemplateInput {
    label?: string;
    description?: string;
    field_schema?: Record<string, any>;
    is_active?: boolean;
    display_order?: number;
}
