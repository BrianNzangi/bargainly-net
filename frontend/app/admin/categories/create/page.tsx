'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AltArrowDown, AddCircle } from '@solar-icons/react'
import toast, { Toaster } from 'react-hot-toast'

interface Category {
    id: string
    name: string
    slug: string
    level: number
}

export default function CreateCategoryPage() {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [level1Categories, setLevel1Categories] = useState<Category[]>([])
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        keywords: '',
        seo_content: '',
        level: 1,
        parent_id: '',
        sort_order: 0,
        image_url: '',
        l2_categories: ''
    })

    useEffect(() => {
        fetchLevel1Categories()
    }, [])

    const fetchLevel1Categories = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/categories')
            if (!response.ok) throw new Error('Failed to fetch categories')

            const data = await response.json()
            const level1 = (data || []).filter((c: Category) => c.level === 1)
            setLevel1Categories(level1)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value }

            // Auto-generate slug from name
            if (field === 'name') {
                updated.slug = value.toString()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
            }

            // Clear parent_id if level is 1
            if (field === 'level' && value === 1) {
                updated.parent_id = ''
            }

            return updated
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            // Build payload
            const payload: any = {
                name: formData.name,
                slug: formData.slug,
                level: formData.level,
                sort_order: formData.sort_order,
            }

            if (formData.meta_title) payload.meta_title = formData.meta_title
            if (formData.meta_description) payload.meta_description = formData.meta_description
            if (formData.keywords) payload.keywords = formData.keywords
            if (formData.seo_content) payload.seo_content = formData.seo_content
            if (formData.image_url) payload.image_url = formData.image_url
            if (formData.level === 2 && formData.parent_id) payload.parent_id = formData.parent_id
            if (formData.l2_categories) payload.l2_categories = formData.l2_categories

            const res = await fetch('http://localhost:3001/api/v1/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to create category')
            }

            toast.success('Category created successfully!')
            // Navigate and force refresh to show new category immediately
            router.push('/admin/categories')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to create category')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                        <Link href="/admin/categories" className="hover:text-indigo-600 transition-colors">Categories</Link>
                        <span>/</span>
                        <span className="text-neutral-900 font-medium">Create New</span>
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900">Create New Category</h1>
                    <p className="mt-2 text-neutral-600">Add a new category to organize your products.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Basic Information</h3>
                            <p className="mt-1 text-sm text-neutral-600">Essential category details</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="e.g., Electronics"
                                />
                            </div>

                            {/* Slug */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => handleChange('slug', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4 font-mono text-sm"
                                    placeholder="e.g., electronics"
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    URL-friendly version of the name (auto-generated)
                                </p>
                            </div>

                            {/* Level */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Level <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.level}
                                        onChange={(e) => handleChange('level', parseInt(e.target.value))}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-2 text-neutral-900 appearance-none bg-white"
                                    >
                                        <option value={1}>Level 1 (Main Category)</option>
                                        <option value={2}>Level 2 (Subcategory)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <AltArrowDown className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Parent Category (only for Level 2) */}
                            {formData.level === 2 && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Parent Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.parent_id}
                                            onChange={(e) => handleChange('parent_id', e.target.value)}
                                            className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-2 text-neutral-900 appearance-none bg-white"
                                        >
                                            <option value="">Select parent category</option>
                                            {level1Categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <AltArrowDown className="h-5 w-5 text-neutral-400" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="0"
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    Lower numbers appear first
                                </p>
                            </div>

                            {/* Image URL */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => handleChange('image_url', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Information */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">SEO Information</h3>
                            <p className="mt-1 text-sm text-neutral-600">Optimize for search engines</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Meta Title */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.meta_title}
                                    onChange={(e) => handleChange('meta_title', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="SEO title for this category"
                                    maxLength={60}
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    {formData.meta_title.length}/60 characters
                                </p>
                            </div>

                            {/* Meta Description */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.meta_description}
                                    onChange={(e) => handleChange('meta_description', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="Brief description for search engines"
                                    maxLength={160}
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    {formData.meta_description.length}/160 characters
                                </p>
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Keywords
                                </label>
                                <input
                                    type="text"
                                    value={formData.keywords}
                                    onChange={(e) => handleChange('keywords', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    Comma-separated keywords
                                </p>
                            </div>

                            {/* SEO Content */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    SEO Content
                                </label>
                                <textarea
                                    rows={6}
                                    value={formData.seo_content}
                                    onChange={(e) => handleChange('seo_content', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="Rich content for this category page"
                                />
                            </div>
                        </div>
                    </div>

                    {/* L2 Categories (only for Level 1) */}
                    {formData.level === 1 && (
                        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                                <h3 className="text-lg font-semibold text-neutral-700">Subcategories</h3>
                                <p className="mt-1 text-sm text-neutral-600">Optional subcategory information</p>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    L2 Categories
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.l2_categories}
                                    onChange={(e) => handleChange('l2_categories', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="Additional subcategory data (optional)"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-neutral-200 px-6 py-4">
                        <Link
                            href="/admin/categories"
                            className="px-6 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <AddCircle className="mr-2 h-5 w-5" />
                                    Create Category
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
