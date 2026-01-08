'use client'

import { useState, useEffect } from 'react'
import { AddCircle, TrashBinMinimalistic, MagniferZoomIn, AltArrowDown } from '@solar-icons/react'
import RichTextEditor from './RichTextEditor'

interface Product {
    id: string
    title: string
    brand?: string
    price_current?: number
    currency?: string
    images?: any
    merchant_name?: string
    category?: {
        name: string
    }
}

interface Category {
    id: string
    name: string
    level: number
}

export interface GuideItem {
    product_id: string
    product_title: string
    product_image?: string
    guide_text: string
    price_display: string
    order: number
}

interface GuideItemsManagerProps {
    items: GuideItem[]
    onChange: (items: GuideItem[]) => void
}

export default function GuideItemsManager({ items, onChange }: GuideItemsManagerProps) {
    const [showProductSearch, setShowProductSearch] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        if (showProductSearch) {
            const debounce = setTimeout(() => {
                fetchProducts()
            }, 300)
            return () => clearTimeout(debounce)
        }
    }, [searchTerm, categoryFilter, showProductSearch])

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/categories')
            if (response.ok) {
                const data = await response.json()
                setCategories(data.filter((cat: Category) => cat.level === 1))
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            let url = 'http://localhost:3001/api/v1/products'
            const params = new URLSearchParams()

            if (searchTerm) params.append('search', searchTerm)
            if (categoryFilter) params.append('category', categoryFilter)

            if (params.toString()) url += `?${params.toString()}`

            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setProducts(data.data || data || [])
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const getFirstImage = (images: any) => {
        if (!images) return undefined
        if (Array.isArray(images) && images.length > 0) return images[0]
        if (typeof images === 'object' && images.url) return images.url
        return undefined
    }

    const handleAddProduct = (product: Product) => {
        const priceDisplay = product.price_current
            ? `$${product.price_current.toFixed(2)} at ${product.merchant_name || 'Store'}`
            : 'Price not available'

        const newItem: GuideItem = {
            product_id: product.id,
            product_title: product.title,
            product_image: getFirstImage(product.images),
            guide_text: '',
            price_display: priceDisplay,
            order: items.length + 1
        }

        onChange([...items, newItem])
        setShowProductSearch(false)
        setSearchTerm('')
        setCategoryFilter('')
    }

    const handleUpdateGuideText = (index: number, text: string) => {
        const updatedItems = [...items]
        updatedItems[index].guide_text = text
        onChange(updatedItems)
    }

    const handleRemoveItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index)
        // Reorder remaining items
        updatedItems.forEach((item, i) => {
            item.order = i + 1
        })
        onChange(updatedItems)
    }

    return (
        <div className="space-y-4">
            {/* Items List */}
            {items.length > 0 && (
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div
                            key={`${item.product_id}-${index}`}
                            className="border border-neutral-200 rounded-lg p-4 bg-white"
                        >
                            {/* Header with product info and remove button */}
                            <div className="flex items-start gap-4 mb-4">
                                {/* Product Image */}
                                {item.product_image && (
                                    <div className="w-20 h-20 shrink-0 bg-neutral-100 rounded overflow-hidden">
                                        <img
                                            src={item.product_image}
                                            alt={item.product_title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-neutral-900 mb-1">{item.product_title}</h4>
                                    <p className="text-sm text-green-700 font-medium">{item.price_display}</p>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Remove item"
                                >
                                    <TrashBinMinimalistic className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Guide Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Guide Description for this Product
                                </label>
                                <RichTextEditor
                                    value={item.guide_text}
                                    onChange={(text) => handleUpdateGuideText(index, text)}
                                    placeholder="Write your guide about this product..."
                                    height="150px"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Product Section */}
            {!showProductSearch ? (
                <button
                    type="button"
                    onClick={() => setShowProductSearch(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                    <AddCircle className="w-5 h-5" />
                    <span className="font-medium">Add Product to Guide</span>
                </button>
            ) : (
                <div className="border-2 border-indigo-500 rounded-lg p-4 bg-indigo-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-neutral-900">Search Products</h3>
                        <button
                            type="button"
                            onClick={() => {
                                setShowProductSearch(false)
                                setSearchTerm('')
                                setCategoryFilter('')
                            }}
                            className="text-sm text-neutral-600 hover:text-neutral-900"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Search Filters */}
                    <div className="space-y-3 mb-4">
                        {/* Search Input */}
                        <div className="relative">
                            <MagniferZoomIn className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products by name..."
                                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 border border-neutral-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 appearance-none bg-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <AltArrowDown className="h-5 w-5 text-neutral-400" />
                            </div>
                        </div>
                    </div>

                    {/* Products List */}
                    <div className="bg-white rounded-lg border border-neutral-200 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-neutral-500">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">No products found</div>
                        ) : (
                            <div className="divide-y divide-neutral-200">
                                {products.map(product => {
                                    const imageUrl = getFirstImage(product.images)
                                    return (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => handleAddProduct(product)}
                                            className="w-full flex items-center gap-4 p-3 hover:bg-indigo-50 transition-colors text-left"
                                        >
                                            {/* Product Image */}
                                            <div className="w-16 h-16 shrink-0 bg-neutral-100 rounded overflow-hidden">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-neutral-900 truncate">{product.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {product.brand && (
                                                        <span className="text-xs text-neutral-500">{product.brand}</span>
                                                    )}
                                                    {product.category && (
                                                        <span className="text-xs text-neutral-400">• {product.category.name}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            {product.price_current && (
                                                <div className="text-right shrink-0">
                                                    <div className="font-semibold text-neutral-900">
                                                        {product.currency || 'USD'} {product.price_current.toFixed(2)}
                                                    </div>
                                                    {product.merchant_name && (
                                                        <div className="text-xs text-neutral-500">at {product.merchant_name}</div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
