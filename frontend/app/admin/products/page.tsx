'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { AddCircle, Pen, TrashBinMinimalistic } from '@solar-icons/react'
import { ProductFilters, FilterState } from '@/app/components/admin/ProductFilters'

interface Product {
    id: string
    source: string
    external_id: string
    title: string
    brand?: string | null
    category?: {
        id: string
        name: string
        slug: string
    } | null
    price_current?: number | null
    price_original?: number | null
    currency?: string | null
    availability?: string | null
    images?: any
    created_at: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        category: '',
        source: '',
        availability: '',
        priceMin: '',
        priceMax: '',
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/v1/products')
            const data = await res.json()
            setProducts(data.data || data || [])
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            await fetch(`http://localhost:3001/api/v1/products/${id}`, {
                method: 'DELETE',
            })
            fetchProducts()
        } catch (error) {
            console.error('Failed to delete product:', error)
            alert('Failed to delete product')
        }
    }

    const getFirstImage = (images: any) => {
        if (!images) return null
        if (Array.isArray(images) && images.length > 0) return images[0]
        if (typeof images === 'object' && images.url) return images.url
        return null
    }

    // Filter products based on active filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                const matchesTitle = product.title?.toLowerCase().includes(searchLower)
                const matchesBrand = product.brand?.toLowerCase().includes(searchLower)
                if (!matchesTitle && !matchesBrand) return false
            }

            // Category filter
            if (filters.category && product.category?.id !== filters.category) {
                return false
            }

            // Source filter
            if (filters.source && product.source?.toLowerCase() !== filters.source.toLowerCase()) {
                return false
            }

            // Availability filter
            if (filters.availability && product.availability !== filters.availability) {
                return false
            }

            // Price range filter
            if (filters.priceMin || filters.priceMax) {
                const price = product.price_current
                if (price === null || price === undefined) return false

                if (filters.priceMin && price < parseFloat(filters.priceMin)) {
                    return false
                }
                if (filters.priceMax && price > parseFloat(filters.priceMax)) {
                    return false
                }
            }

            return true
        })
    }, [products, filters])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading products...</div>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center pb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage your product catalog from various sources.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <AddCircle className="mr-2 h-5 w-5" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Filters Component */}
            <ProductFilters
                onFilterChange={setFilters}
                totalProducts={products.length}
                filteredCount={filteredProducts.length}
            />

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-neutral-100 ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Product
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Category
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Price
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Source
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                                                {products.length === 0
                                                    ? 'No products found. Create your first product to get started.'
                                                    : 'No products match your filters. Try adjusting your search criteria.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const imageUrl = getFirstImage(product.images)
                                            return (
                                                <tr key={product.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 shrink-0">
                                                                {imageUrl ? (
                                                                    <img className="h-10 w-10 rounded object-contain" src={imageUrl} alt="" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                                        <span className="text-gray-400 text-xs">No img</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="font-medium text-gray-900">{product.title}</div>
                                                                {product.brand && (
                                                                    <div className="text-gray-500">{product.brand}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {product.category?.name || '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                        {product.price_current ? (
                                                            <div>
                                                                <div className="font-medium">
                                                                    {product.currency || 'USD'} {product.price_current.toFixed(2)}
                                                                </div>
                                                                {product.price_original && product.price_original > product.price_current && (
                                                                    <div className="text-gray-400 line-through text-xs">
                                                                        {product.currency || 'USD'} {product.price_original.toFixed(2)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                                                            {product.source}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${product.availability === 'in_stock'
                                                                ? 'bg-green-100 text-green-800'
                                                                : product.availability === 'out_of_stock'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                        >
                                                            {product.availability || 'unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={`/admin/products/${product.id}/edit`}
                                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                            >
                                                                <Pen className="h-5 w-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="text-red-600 hover:text-red-900 p-1"
                                                            >
                                                                <TrashBinMinimalistic className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
