'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { AddCircle, PenNewSquare, TrashBinTrash, AltArrowDown, AltArrowUp } from '@solar-icons/react'
import toast, { Toaster } from 'react-hot-toast'

interface Category {
    id: string
    name: string
    slug: string
    meta_title?: string
    meta_description?: string
    keywords?: string
    seo_content?: string
    level: number
    parent_id?: string
    sort_order: number
    image_url?: string
    product_count: number
    created_at: string
    updated_at: string
    l2_categories?: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())


    useEffect(() => {
        fetchCategories()

        // Refresh categories when page becomes visible (e.g., after navigating back)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchCategories()
            }
        }

        // Refresh on focus (when user returns to tab/window)
        const handleFocus = () => {
            fetchCategories()
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:3001/api/v1/categories')

            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }

            const data = await response.json()
            setCategories(data || [])
        } catch (error: any) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all subcategories.`)) {
            return
        }

        try {
            const response = await fetch(`http://localhost:3001/api/v1/categories/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete category')
            }

            toast.success('Category deleted successfully')
            fetchCategories()
        } catch (error: any) {
            console.error('Error deleting category:', error)
            toast.error('Failed to delete category')
        }
    }

    const toggleExpand = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
        } else {
            newExpanded.add(categoryId)
        }
        setExpandedCategories(newExpanded)
    }

    // Organize categories by hierarchy
    const level1Categories = categories.filter(c => c.level === 1).sort((a, b) => a.sort_order - b.sort_order)
    const getCategoryChildren = (parentId: string) => {
        return categories.filter(c => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order)
    }



    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-neutral-600">Loading categories...</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>
                            <p className="mt-2 text-neutral-600">
                                Manage product categories and subcategories
                            </p>
                        </div>
                        <Link
                            href="/admin/categories/create"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <AddCircle className="mr-2 h-5 w-5" weight="Bold" />
                            Add Category
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <div className="text-sm font-medium text-neutral-600">Total Categories</div>
                        <div className="mt-2 text-3xl font-bold text-neutral-900">{categories.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <div className="text-sm font-medium text-neutral-600">Level 1 Categories</div>
                        <div className="mt-2 text-3xl font-bold text-neutral-900">{level1Categories.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <div className="text-sm font-medium text-neutral-600">Total Products</div>
                        <div className="mt-2 text-3xl font-bold text-neutral-900">
                            {categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)}
                        </div>
                    </div>
                </div>

                {/* Categories List */}
                {level1Categories.length === 0 ? (
                    <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                        <div className="text-neutral-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No categories yet</h3>
                        <p className="text-neutral-600 mb-6">Get started by creating your first category</p>
                        <Link
                            href="/admin/categories/create"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <AddCircle className="mr-2 h-5 w-5" weight="Bold" />
                            Create Category
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Slug
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Products
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Sort Order
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {level1Categories.map((category) => {
                                        const children = getCategoryChildren(category.id)
                                        const isExpanded = expandedCategories.has(category.id)

                                        return (
                                            <Fragment key={category.id}>
                                                {/* Level 1 Category */}
                                                <tr className="hover:bg-neutral-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {children.length > 0 && (
                                                                <button
                                                                    onClick={() => toggleExpand(category.id)}
                                                                    className="mr-2 p-1 hover:bg-neutral-200 rounded transition"
                                                                >
                                                                    {isExpanded ? (
                                                                        <AltArrowDown size={16} weight="Bold" className="text-neutral-600" />
                                                                    ) : (
                                                                        <AltArrowUp size={16} weight="Bold" className="text-neutral-600" style={{ transform: 'rotate(-90deg)' }} />
                                                                    )}
                                                                </button>
                                                            )}
                                                            <div className="flex items-center">
                                                                {category.image_url && (
                                                                    <img
                                                                        src={category.image_url}
                                                                        alt={category.name}
                                                                        className="h-10 w-10 rounded object-cover mr-3"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="text-sm font-medium text-neutral-900">
                                                                        {category.name}
                                                                    </div>
                                                                    {children.length > 0 && (
                                                                        <div className="text-xs text-neutral-500">
                                                                            {children.length} subcategories
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-neutral-600 font-mono">
                                                            {category.slug}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-neutral-900">
                                                            {category.product_count || 0}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-neutral-600">
                                                            {category.sort_order}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Link
                                                                href={`/admin/categories/${category.id}/edit`}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                                title="Edit"
                                                            >
                                                                <PenNewSquare size={18} weight="Bold" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(category.id, category.name)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                                title="Delete"
                                                            >
                                                                <TrashBinTrash size={18} weight="Bold" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Level 2 Categories (Children) */}
                                                {isExpanded && children.map((child) => (
                                                    <tr key={child.id} className="bg-neutral-50 hover:bg-neutral-100">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center pl-8">
                                                                {child.image_url && (
                                                                    <img
                                                                        src={child.image_url}
                                                                        alt={child.name}
                                                                        className="h-8 w-8 rounded object-cover mr-3"
                                                                    />
                                                                )}
                                                                <div className="text-sm text-neutral-700">
                                                                    ↳ {child.name}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-neutral-500 font-mono">
                                                                {child.slug}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-neutral-700">
                                                                {child.product_count || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-neutral-500">
                                                                {child.sort_order}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Link
                                                                    href={`/admin/categories/${child.id}/edit`}
                                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                                    title="Edit"
                                                                >
                                                                    <PenNewSquare size={18} weight="Bold" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(child.id, child.name)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                                    title="Delete"
                                                                >
                                                                    <TrashBinTrash size={18} weight="Bold" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>


                    </div>
                )}
            </div>
        </div>
    )
}
