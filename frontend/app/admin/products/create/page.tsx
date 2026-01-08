'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AltArrowDown, AddCircle } from '@solar-icons/react'
import toast, { Toaster } from 'react-hot-toast'
import CategorySelector from '../components/CategorySelector'

const SOURCES = ['canopy', 'amazon', 'awin', 'cj', 'rakuten', 'impact', 'manual']
const AFFILIATE_NETWORKS = ['amazon', 'awin', 'cj', 'impact', 'rakuten', 'manual']
const AVAILABILITY_OPTIONS = ['in_stock', 'out_of_stock', 'unknown']

export default function CreateProductPage() {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [bulkImportData, setBulkImportData] = useState('')
    const [formData, setFormData] = useState({
        source: 'manual' as string,
        external_id: '',
        title: '',
        brand: '',
        category_id: '',
        tags: '',
        price_current: '',
        price_original: '',
        currency: 'USD',
        product_url: '',
        affiliate_url: '',
        affiliate_network: '' as string,
        availability: 'in_stock' as string,
        rating: '',
        total_ratings: '',
        merchant_name: '',
        merchant_logo: '',
        images: '',
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Fetch Amazon partner tag from API settings
    const fetchPartnerTag = async (): Promise<string> => {
        try {
            // Use unmask=true to get decrypted values for internal use
            const response = await fetch('http://localhost:3001/api/v1/settings?category=api_integration&unmask=true')
            if (!response.ok) return ''

            const data = await response.json()
            const amazonSetting = data.data?.find((s: any) =>
                s.key.startsWith('amazon_pa_api') && s.is_active
            )

            // Return partner_tag if found, otherwise empty string
            return amazonSetting?.value?.partner_tag || ''
        } catch (error) {
            console.error('Failed to fetch partner tag:', error)
            return ''
        }
    }

    const handleBulkImportParse = async () => {
        if (!bulkImportData.trim()) {
            toast.error('Please paste product data first')
            return
        }

        try {
            // Try parsing as JSON first
            const parsed = JSON.parse(bulkImportData)

            // Extract ASIN from URL if not directly provided
            let asin = parsed.asin || parsed.external_id || parsed.id || ''
            if (!asin && parsed.url) {
                const asinMatch = parsed.url.match(/\/dp\/([A-Z0-9]{10})/)
                if (asinMatch) asin = asinMatch[1]
            }

            // Handle images - only use the FIRST image
            let firstImageUrl = ''
            if (Array.isArray(parsed.images) && parsed.images.length > 0) {
                firstImageUrl = parsed.images[0]
            } else if (parsed.image_urls && Array.isArray(parsed.image_urls) && parsed.image_urls.length > 0) {
                firstImageUrl = parsed.image_urls[0]
            }

            // Extract brand from title or other fields
            let brand = parsed.brand || ''
            if (!brand && parsed.title) {
                // Try to extract brand from title (usually first word or before comma)
                const titleParts = parsed.title.split(',')
                const firstPart = titleParts[0].trim()
                const words = firstPart.split(' ')
                if (words.length > 0) brand = words[0]
            }

            // Auto-detect affiliate network from URL
            let affiliateNetwork = 'amazon' // Default for Amazon products
            const productUrl = parsed.url || parsed.product_url || ''
            if (productUrl.includes('amazon.com') || productUrl.includes('amzn.')) {
                affiliateNetwork = 'amazon'
            } else if (productUrl.includes('awin') || productUrl.includes('awin1.com')) {
                affiliateNetwork = 'awin'
            } else if (productUrl.includes('cj.com') || productUrl.includes('commission')) {
                affiliateNetwork = 'cj'
            } else if (productUrl.includes('impact.com')) {
                affiliateNetwork = 'impact'
            } else if (productUrl.includes('rakuten')) {
                affiliateNetwork = 'rakuten'
            }

            // Generate affiliate URL with partner tag (for Amazon)
            let affiliateUrl = parsed.affiliate_url || parsed.affiliate_link || ''
            if (!affiliateUrl && productUrl && affiliateNetwork === 'amazon' && asin) {
                // Fetch partner tag from API settings
                const partnerTag = await fetchPartnerTag()

                if (partnerTag) {
                    // Generate Amazon affiliate URL with actual partner tag
                    // Format: https://www.amazon.com/dp/ASIN?tag=PARTNER_TAG
                    affiliateUrl = `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`
                } else {
                    // No partner tag configured, use product URL
                    affiliateUrl = productUrl
                    toast.error('Amazon partner tag not configured in API settings')
                }
            }

            // Auto-detect merchant name
            let merchantName = parsed.merchant_name || 'Amazon'
            if (productUrl.includes('amazon')) {
                merchantName = 'Amazon'
            } else if (brand) {
                merchantName = brand
            }

            // Map Amazon API fields to our schema
            setFormData(prev => ({
                ...prev,
                external_id: asin,
                title: parsed.title || parsed.name || '',
                brand: brand,
                category_id: '', // Will need to be set manually from dropdown
                tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || ''),
                price_current: parsed.price || parsed.price_current || parsed.current_price || '',
                price_original: parsed.originalPrice || parsed.price_original || parsed.list_price || parsed.original_price || '',
                currency: parsed.currency === '$' ? 'USD' : (parsed.currency || 'USD'),
                product_url: productUrl,
                affiliate_url: affiliateUrl,
                affiliate_network: affiliateNetwork,
                rating: parsed.rate || parsed.rating || parsed.average_rating || '',
                total_ratings: parsed.rateCount?.toString() || parsed.total_ratings?.toString() || parsed.ratings_total?.toString() || parsed.review_count?.toString() || '',
                merchant_name: merchantName,
                merchant_logo: parsed.merchant_logo || '',
                images: firstImageUrl, // Only first image as a single URL string
                availability: parsed.availability || (parsed.flashOffer ? 'in_stock' : 'in_stock'),
            }))

            toast.success('Product data imported successfully!')
            setBulkImportData('')
        } catch (e) {
            // If JSON parsing fails, try text format with tab-separated values
            try {
                const lines = bulkImportData.split('\n')
                const data: any = {}
                let currentKey = ''
                let currentValue = ''

                lines.forEach(line => {
                    const trimmedLine = line.trim()
                    if (!trimmedLine) return

                    // Check if line contains a tab (key-value separator)
                    const tabIndex = line.indexOf('\t')
                    if (tabIndex > 0) {
                        // Save previous key-value if exists
                        if (currentKey) {
                            data[currentKey.toLowerCase().replace(/\s+/g, '_').replace(/\./g, '')] = currentValue.trim()
                        }

                        // Extract new key-value
                        currentKey = line.substring(0, tabIndex).trim()
                        currentValue = line.substring(tabIndex + 1).trim()
                    } else if (currentKey && trimmedLine) {
                        // Continuation of previous value (multi-line)
                        currentValue += ' ' + trimmedLine
                    }
                })

                // Save last key-value pair
                if (currentKey) {
                    data[currentKey.toLowerCase().replace(/\s+/g, '_').replace(/\./g, '')] = currentValue.trim()
                }

                // Extract rating and count from "X out of 5" format
                let rating = ''
                let totalRatings = ''
                if (data.avg_customer_reviews) {
                    const ratingMatch = data.avg_customer_reviews.match(/(\d+\.?\d*)\s*out\s*of\s*5/)
                    if (ratingMatch) rating = ratingMatch[1]
                }
                if (data.ratings_count) {
                    const countMatch = data.ratings_count.match(/\(?([\d,]+)\)?/)
                    if (countMatch) totalRatings = countMatch[1].replace(/,/g, '')
                }

                // Extract price from "$XX.XX" format
                let priceValue = ''
                if (data.price) {
                    const priceMatch = data.price.match(/\$?([\d,]+\.?\d*)/)
                    if (priceMatch) priceValue = priceMatch[1].replace(/,/g, '')
                }

                // Extract brand from store link
                let brand = data.brand || ''
                if (!brand && data.store_link) {
                    const brandMatch = data.store_link.match(/Visit the (.+?) Store/)
                    if (brandMatch) brand = brandMatch[1]
                }

                setFormData(prev => ({
                    ...prev,
                    external_id: data.asin || '',
                    title: data.title || '',
                    brand: brand,
                    category_id: '', // Will need to be set manually from dropdown
                    price_current: priceValue,
                    product_url: data.product_url || data.url || '',
                    availability: data.availability?.toLowerCase().includes('in stock') ? 'in_stock' :
                        data.availability?.toLowerCase().includes('out of stock') ? 'out_of_stock' : 'unknown',
                    rating: rating,
                    total_ratings: totalRatings,
                    merchant_name: data.merchant_info?.includes('Amazon') ? 'Amazon' : (data.merchant_info || ''),
                }))

                toast.success('Product data imported successfully!')
                setBulkImportData('')
            } catch (err) {
                console.error('Parse error:', err)
                toast.error('Failed to parse product data. Please check the format and try again.')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            // Build payload
            const payload: any = {
                source: formData.source,
                external_id: formData.external_id,
                title: formData.title,
            }

            if (formData.brand) payload.brand = formData.brand
            if (formData.category_id) payload.category_id = formData.category_id
            if (formData.tags) payload.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            if (formData.price_current) payload.price_current = parseFloat(formData.price_current)
            if (formData.price_original) payload.price_original = parseFloat(formData.price_original)
            if (formData.currency) payload.currency = formData.currency
            if (formData.product_url) payload.product_url = formData.product_url
            if (formData.affiliate_url) payload.affiliate_url = formData.affiliate_url
            if (formData.affiliate_network) payload.affiliate_network = formData.affiliate_network
            if (formData.availability) payload.availability = formData.availability
            if (formData.rating) payload.rating = parseFloat(formData.rating)
            if (formData.total_ratings) payload.total_ratings = parseInt(formData.total_ratings)
            if (formData.merchant_name) payload.merchant_name = formData.merchant_name
            if (formData.merchant_logo) payload.merchant_logo = formData.merchant_logo
            if (formData.images) {
                try {
                    payload.images = JSON.parse(formData.images)
                } catch {
                    // If not valid JSON, treat as array of URLs
                    payload.images = formData.images.split(',').map(url => url.trim()).filter(Boolean)
                }
            }

            const res = await fetch('http://localhost:3001/api/v1/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to create product')
            }

            toast.success('Product created successfully!')
            setTimeout(() => router.push('/admin/products'), 1000)
        } catch (error: any) {
            toast.error(error.message || 'Failed to create product')
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
                        <Link href="/admin/products" className="hover:text-indigo-600 transition-colors">Products</Link>
                        <span>/</span>
                        <span className="text-neutral-900 font-medium">Create New</span>
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900">Create New Product</h1>
                    <p className="mt-2 text-neutral-600">Add a new product to your catalog from various sources.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Source Selection */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Product Source</h3>
                            <p className="mt-1 text-sm text-neutral-600">Select where this product is coming from</p>
                        </div>
                        <div className="p-6">
                            <div className="relative max-w-md">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Source <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.source}
                                        onChange={(e) => handleChange('source', e.target.value)}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-1 text-neutral-900 appearance-none bg-white"
                                    >
                                        {SOURCES.map(source => (
                                            <option key={source} value={source}>{source}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <AltArrowDown className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amazon Bulk Import - Only visible when Amazon is selected */}
                    {formData.source === 'amazon' && (
                        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                            <div className="bg-neutral-200 px-6 py-4 border-b border-neutral-200">
                                <h3 className="text-lg font-semibold text-neutral-700">Amazon Product Import</h3>
                                <p className="mt-1 text-sm text-neutral-600">Paste Amazon product data in tab-separated or JSON format to auto-fill the form</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Product Data (Tab-Separated or JSON)
                                        </label>
                                        <textarea
                                            rows={8}
                                            value={bulkImportData}
                                            onChange={(e) => setBulkImportData(e.target.value)}
                                            className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-2 px-4 font-mono text-sm"
                                            placeholder={`Paste tab-separated format:
Title\tGarmin vívoactive 5...
ASIN\tB0CG6NBJ61
Price\t$186.83
Availability\tIn Stock

Or JSON format:
{
  "asin": "B08N5WRWNW",
  "title": "Product Name",
  "price": 29.99
}`}
                                        />
                                        <p className="mt-2 text-xs text-neutral-500">
                                            Supports tab-separated text (copy from product pages) or JSON format
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleBulkImportParse}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                        >
                                            Parse & Fill Form
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBulkImportData('')}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Basic Information</h3>
                            <p className="mt-1 text-sm text-neutral-600">Essential product details and identifiers</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* External ID */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    External ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.external_id}
                                    onChange={(e) => handleChange('external_id', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="e.g., B08N5WRWNW"
                                />
                            </div>

                            {/* Title */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Product Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="Enter product title"
                                />
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Brand</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => handleChange('brand', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="e.g., Apple"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <CategorySelector
                                    value={formData.category_id}
                                    onChange={(categoryId) => handleChange('category_id', categoryId)}
                                />
                            </div>

                            {/* Tags */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Tags</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="wireless, bluetooth, portable (comma-separated)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Pricing</h3>
                            <p className="mt-1 text-sm text-neutral-600">Set product pricing and currency</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Current Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price_current}
                                        onChange={(e) => handleChange('price_current', e.target.value)}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 pl-8 pr-4"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Original Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price_original}
                                        onChange={(e) => handleChange('price_original', e.target.value)}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 pl-8 pr-4"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Currency</label>
                                <input
                                    type="text"
                                    value={formData.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="USD"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Links & Affiliate */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Links & Affiliate</h3>
                            <p className="mt-1 text-sm text-neutral-600">Product URLs and affiliate information</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Product URL</label>
                                <input
                                    type="url"
                                    value={formData.product_url}
                                    onChange={(e) => handleChange('product_url', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="https://example.com/product"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Affiliate URL</label>
                                <input
                                    type="url"
                                    value={formData.affiliate_url}
                                    onChange={(e) => handleChange('affiliate_url', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="https://affiliate.link/product"
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Affiliate Network</label>
                                <div className="relative">
                                    <select
                                        value={formData.affiliate_network}
                                        onChange={(e) => handleChange('affiliate_network', e.target.value)}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-1 text-neutral-900 appearance-none bg-white"
                                    >
                                        <option value="">Select network</option>
                                        {AFFILIATE_NETWORKS.map(network => (
                                            <option key={network} value={network}>{network}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <AltArrowDown className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Availability</label>
                                <div className="relative">
                                    <select
                                        value={formData.availability}
                                        onChange={(e) => handleChange('availability', e.target.value)}
                                        className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-1 text-neutral-900 appearance-none bg-white"
                                    >
                                        {AVAILABILITY_OPTIONS.map(option => (
                                            <option key={option} value={option}>
                                                {option.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <AltArrowDown className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700">Additional Information</h3>
                            <p className="mt-1 text-sm text-neutral-600">Ratings, merchant details, and images</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Rating (0-5)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => handleChange('rating', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="4.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Total Ratings</label>
                                <input
                                    type="number"
                                    value={formData.total_ratings}
                                    onChange={(e) => handleChange('total_ratings', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="1234"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Merchant Name</label>
                                <input
                                    type="text"
                                    value={formData.merchant_name}
                                    onChange={(e) => handleChange('merchant_name', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="e.g., Amazon"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Merchant Logo URL</label>
                                <input
                                    type="url"
                                    value={formData.merchant_logo}
                                    onChange={(e) => handleChange('merchant_logo', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Product Images</label>
                                <textarea
                                    rows={4}
                                    value={formData.images}
                                    onChange={(e) => handleChange('images', e.target.value)}
                                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 py-1 px-4 font-mono text-sm"
                                    placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
                                />
                                <p className="mt-2 text-sm text-neutral-500">
                                    Enter as JSON array or comma-separated URLs
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-neutral-200 px-6 py-4">
                        <Link
                            href="/admin/products"
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
                                    Create Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
