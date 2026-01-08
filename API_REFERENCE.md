# API Reference - Bargainly v1

Complete API documentation for all endpoints.

**Base URL:** `http://localhost:3001/api/v1`

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Users API

### List Users
```http
GET /api/v1/users
```

**Auth:** Required  
**Returns:** Array of users

**Example Response:**
```json
[
  {
    "id": "uuid",
    "email": "admin@workit.com",
    "name": "Super Admin",
    "role": "ADMIN",
    "is_enabled": true,
    "created_at": "2025-12-27T00:00:00Z"
  }
]
```

### Get User
```http
GET /api/v1/users/:id
```

**Auth:** Required  
**Returns:** Single user object

### Create User
```http
POST /api/v1/users
```

**Auth:** Required (Admin only)  
**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "EDITOR",
  "is_enabled": true
}
```

### Update User
```http
PATCH /api/v1/users/:id
```

**Auth:** Required (Admin only)  
**Body:** Partial user object

### Delete User
```http
DELETE /api/v1/users/:id
```

**Auth:** Required (Admin only)  
**Returns:** Success message

---

## Categories API

### List Categories
```http
GET /api/v1/categories
```

**Auth:** Public  
**Returns:** Array of categories

**Example Response:**
```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and gadgets",
    "parent_id": null,
    "created_at": "2025-12-27T00:00:00Z"
  }
]
```

### Get Category
```http
GET /api/v1/categories/:id
```

**Auth:** Public  
**Returns:** Single category object

### Create Category
```http
POST /api/v1/categories
```

**Auth:** Required (Admin/Editor)  
**Body:**
```json
{
  "name": "Laptops",
  "slug": "laptops",
  "description": "Laptop computers",
  "parent_id": "electronics-uuid"
}
```

### Update Category
```http
PATCH /api/v1/categories/:id
```

**Auth:** Required (Admin/Editor)  
**Body:** Partial category object

### Delete Category
```http
DELETE /api/v1/categories/:id
```

**Auth:** Required (Admin only)  
**Returns:** Success message

---

## Guides API

### List Guides
```http
GET /api/v1/guides
```

**Auth:** Optional  
- **Public:** Only published guides  
- **Authenticated:** All guides

**Returns:** Array of guides with author details

**Example Response:**
```json
[
  {
    "id": "uuid",
    "title": "Best Budget Laptops 2025",
    "slug": "best-budget-laptops-2025",
    "content": "Full guide content...",
    "status": "published",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "created_at": "2025-12-27T00:00:00Z",
    "published_at": "2025-12-27T00:00:00Z"
  }
]
```

### Get Guide
```http
GET /api/v1/guides/:id
```

**Auth:** Optional  
- **Public:** Only if status is "published"  
- **Authenticated:** Any status

**Returns:** Single guide object

### Create Guide
```http
POST /api/v1/guides
```

**Auth:** Required (Admin/Editor)  
**Body:**
```json
{
  "title": "Best Budget Laptops 2025",
  "slug": "best-budget-laptops-2025",
  "content": "Full guide content...",
  "author_id": "user-uuid",
  "category_id": "category-uuid",
  "status": "draft",
  "meta_title": "SEO title",
  "meta_description": "SEO description"
}
```

### Update Guide
```http
PATCH /api/v1/guides/:id
```

**Auth:** Required (Admin/Editor/Author)  
**Body:** Partial guide object

### Delete Guide
```http
DELETE /api/v1/guides/:id
```

**Auth:** Required (Admin only)  
**Returns:** Success message

---

## Products API

### List Products
```http
GET /api/v1/products
```

**Auth:** Optional  
- **Public:** Only active products  
- **Authenticated:** All products

**Returns:** Array of products with category details

**Example Response:**
```json
[
  {
    "id": "uuid",
    "name": "MacBook Air M2",
    "slug": "macbook-air-m2",
    "price": 1199.99,
    "sale_price": 999.99,
    "sku": "MBA-M2-256",
    "is_active": true,
    "category": {
      "id": "uuid",
      "name": "Laptops",
      "slug": "laptops"
    },
    "created_at": "2025-12-27T00:00:00Z"
  }
]
```

### Get Product
```http
GET /api/v1/products/:id
```

**Auth:** Optional  
- **Public:** Only if is_active is true  
- **Authenticated:** Any status

**Returns:** Single product object

### Create Product
```http
POST /api/v1/products
```

**Auth:** Required (Admin/Editor)  
**Body:**
```json
{
  "name": "MacBook Air M2",
  "slug": "macbook-air-m2",
  "description": "Product description",
  "price": 1199.99,
  "sale_price": 999.99,
  "category_id": "category-uuid",
  "sku": "MBA-M2-256",
  "stock": 50,
  "is_active": true
}
```

### Update Product
```http
PATCH /api/v1/products/:id
```

**Auth:** Required (Admin/Editor)  
**Body:** Partial product object

### Delete Product
```http
DELETE /api/v1/products/:id
```

**Auth:** Required (Admin only)  
**Returns:** Success message

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "statusMessage": "Descriptive error message"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with cURL

### List Categories (Public)
```bash
curl http://localhost:3001/api/v1/categories
```

### List Users (Authenticated)
```bash
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3001/api/v1/users
```

### Create Category
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptops","slug":"laptops"}' \
  http://localhost:3001/api/v1/categories
```

### Update Product
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"price":899.99}' \
  http://localhost:3001/api/v1/products/PRODUCT_ID
```

### Delete Guide
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3001/api/v1/guides/GUIDE_ID
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

---

## Pagination

Pagination is built into the base repository but not yet exposed in the API routes. To add pagination:

```typescript
const page = parseInt(getQuery(event).page as string) || 1
const limit = parseInt(getQuery(event).limit as string) || 10

const result = await service.findAll({ page, limit })
```

---

## Filtering

Add query parameters for filtering:

```http
GET /api/v1/guides?status=published&category=electronics
GET /api/v1/products?min_price=100&max_price=500
```

Implement in your endpoints:
```typescript
const filters = {
  status: getQuery(event).status,
  category_id: getQuery(event).category
}
```
