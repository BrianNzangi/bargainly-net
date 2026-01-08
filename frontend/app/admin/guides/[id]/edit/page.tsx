'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AltArrowDown, PenNewSquare } from '@solar-icons/react'
import toast, { Toaster } from 'react-hot-toast'
import RichTextEditor from '../../components/RichTextEditor'
import ImageUpload from '../../components/ImageUpload'
import GuideCategorySelector from '../../components/GuideCategorySelector'
import GuideItemsManager, { GuideItem } from '../../components/GuideItemsManager'

const STATUS_OPTIONS = ['draft', 'published', 'archived']

export default function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        intro: '',
        conclusion: '',
        featured_image: '',
        featured_image_alt: '',
        category: '',
        collection: '',
        tags: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        author_id: '',
        author_name: '',
        status: 'draft' as string,
        is_featured: false,
    })
    const [guideItems, setGuideItems] = useState<GuideItem[]>([])

    useEffect(() => {
        fetchGuide()
    }, [id])

    const fetchGuide = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`http://localhost:3001/api/v1/guides/${id}`, {
                headers: {
                    'Authorization': 'Bearer admin'
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch guide')
            }
            const guide = await response.json()

            // Pre-populate form with existing data
            setFormData({
                title: guide.title || '',
                slug: guide.slug || '',
                excerpt: guide.excerpt || '',
                intro: guide.intro || '',
                conclusion: guide.conclusion || '',
                featured_image: guide.featured_image || '',
                featured_image_alt: guide.featured_image_alt || '',
                category: guide.category || '',
                collection: guide.collection || '',
                tags: Array.isArray(guide.tags) ? guide.tags.join(', ') : '',
                seo_title: guide.seo_meta?.title || '',
                seo_description: guide.seo_meta?.description || '',
                seo_keywords: guide.seo_meta?.keywords || '',
                author_id: guide.author_id || '',
                author_name: guide.author_name || '',
                status: guide.status || 'draft',
                is_featured: guide.is_featured || false,
            })

            // Load guide items
            if (guide.items && Array.isArray(guide.items)) {
                setGuideItems(guide.items)
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load guide')
            setTimeout(() => router.push('/admin/guides'), 2000)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value }

            // Auto-populate SEO title from title
            if (field === 'title' && typeof value === 'string') {
                if (!prev.seo_title || prev.seo_title === prev.title) {
                    updated.seo_title = value
                }
            }

            // Auto-populate SEO description from intro (strip HTML)
            if (field === 'intro' && typeof value === 'string') {
                const strippedIntro = value.replace(/<[^>]*>/g, '').trim()
                if (!prev.seo_description || prev.seo_description === prev.intro?.replace(/<[^>]*>/g, '').trim()) {
                    updated.seo_description = strippedIntro.substring(0, 160) // Limit to 160 chars for SEO
                }
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
                title: formData.title,
                slug: formData.slug,
                status: formData.status,
                is_featured: formData.is_featured,
            }


            if (formData.excerpt) payload.excerpt = formData.excerpt
            if (formData.intro) payload.intro = formData.intro
            if (formData.conclusion) payload.conclusion = formData.conclusion
            if (formData.featured_image) payload.featured_image = formData.featured_image
            if (formData.featured_image_alt) payload.featured_image_alt = formData.featured_image_alt
            if (formData.category) payload.category = formData.category
            if (formData.collection) payload.collection = formData.collection
            if (formData.author_id) payload.author_id = formData.author_id
            if (formData.author_name) payload.author_name = formData.author_name

            // Handle tags array
            if (formData.tags) {
                payload.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            }

            // Handle SEO meta
            if (formData.seo_title || formData.seo_description || formData.seo_keywords) {
                payload.seo_meta = {
                    title: formData.seo_title || '',
                    description: formData.seo_description || '',
                    keywords: formData.seo_keywords || '',
                }
            }

            // Handle guide items
            if (guideItems.length > 0) {
                payload.items = guideItems
            }

            const res = await fetch(`http://localhost:3001/api/v1/guides/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to update guide')
            }

            toast.success('Guide updated successfully!')
            setTimeout(() => router.push('/admin/guides'), 1000)
        } catch (error: any) {
            toast.error(error.message || 'Failed to update guide')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-neutral-600">Loading guide...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                        <Link href="/admin/guides" className="hover:text-indigo-600 transition-colors">Guides</Link>
                        <span>/</span>
                        <span className="text-neutral-900 font-medium">Edit Guide</span>
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900">Edit Guide</h1>
                    <p className="mt-2 text-neutral-600">Update guide information and content.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Basic Information</h3>
                            <p className="mt-1 text-sm text-neutral-600">Essential guide details and identifiers</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="e.g., Best Wireless Headphones for 2024"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => handleChange('slug', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="best-wireless-headphones-2024"
                                />
                            </div>



                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Excerpt</label>
                                <textarea
                                    rows={2}
                                    value={formData.excerpt}
                                    onChange={(e) => handleChange('excerpt', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="Short excerpt for previews..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Content</h3>
                            <p className="mt-1 text-sm text-neutral-600">Introduction and conclusion sections</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Intro - Rich Text */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Introduction</label>
                                <RichTextEditor
                                    value={formData.intro}
                                    onChange={(value) => handleChange('intro', value)}
                                    placeholder="Opening paragraph for the guide..."
                                    height="200px"
                                />
                            </div>

                            {/* Conclusion - Rich Text */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Conclusion</label>
                                <RichTextEditor
                                    value={formData.conclusion}
                                    onChange={(value) => handleChange('conclusion', value)}
                                    placeholder="Closing thoughts and recommendations..."
                                    height="200px"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Media</h3>
                            <p className="mt-1 text-sm text-neutral-600">Featured image for the guide</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Featured Image Upload */}
                            <ImageUpload
                                value={formData.featured_image}
                                onChange={(url) => handleChange('featured_image', url)}
                                label="Featured Image"
                                folder="guides/featured"
                            />

                            {/* Featured Image Alt */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Featured Image Alt Text</label>
                                <input
                                    type="text"
                                    value={formData.featured_image_alt}
                                    onChange={(e) => handleChange('featured_image_alt', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="Description of the featured image"
                                />
                            </div>


                        </div>
                    </div>

                    {/* Categorization */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Categorization</h3>
                            <p className="mt-1 text-sm text-neutral-600">Category and tags for organization</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Category Selector */}
                            <GuideCategorySelector
                                value={formData.category}
                                onChange={(categoryName) => handleChange('category', categoryName)}
                            />

                            {/* Homepage Collection */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Homepage Collection
                                    <span className="ml-2 text-xs text-neutral-500">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.collection}
                                        onChange={(e) => handleChange('collection', e.target.value)}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-2 text-neutral-900 appearance-none bg-white"
                                    >
                                        <option value="">None</option>
                                        <option value="smart-homes">Smart Homes</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="deals">Deals</option>
                                        <option value="tech">Tech</option>
                                        <option value="health">Health</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <AltArrowDown className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Select a homepage collection to feature this guide in a specific section
                                </p>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Tags</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="wireless, headphones, audio (comma-separated)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">SEO Metadata</h3>
                            <p className="mt-1 text-sm text-neutral-600">Auto-populated from title and introduction, but can be customized</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO Title</label>
                                <input
                                    type="text"
                                    value={formData.seo_title}
                                    onChange={(e) => handleChange('seo_title', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="SEO-optimized title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.seo_description}
                                    onChange={(e) => handleChange('seo_description', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="Meta description for search engines"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO Keywords</label>
                                <input
                                    type="text"
                                    value={formData.seo_keywords}
                                    onChange={(e) => handleChange('seo_keywords', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guide Items */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Guide Items</h3>
                            <p className="mt-1 text-sm text-neutral-600">Add products with recommendations and pricing</p>
                        </div>
                        <div className="p-6">
                            <GuideItemsManager
                                items={guideItems}
                                onChange={setGuideItems}
                            />
                        </div>
                    </div>

                    {/* Publishing */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Publishing</h3>
                            <p className="mt-1 text-sm text-neutral-600">Status and visibility settings</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Status */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                                <div className="relative">
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-2 text-neutral-900 appearance-none bg-white"
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <AltArrowDown className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Is Featured */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_featured" className="ml-2 block text-sm text-neutral-700">
                                    Featured Guide
                                </label>
                            </div>

                            {/* Author Name */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Author Name</label>
                                <input
                                    type="text"
                                    value={formData.author_name}
                                    onChange={(e) => handleChange('author_name', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Author ID */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Author ID (UUID)</label>
                                <input
                                    type="text"
                                    value={formData.author_id}
                                    onChange={(e) => handleChange('author_id', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4"
                                    placeholder="Optional UUID"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-neutral-200 px-6 py-4">
                        <Link
                            href="/admin/guides"
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
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <PenNewSquare className="mr-2 h-5 w-5" />
                                    Update Guide
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
