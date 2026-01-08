'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '../public/Container'
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react'
import { SidebarAds } from './SidebarAds'

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string
    featured_image: string | null
    category: string
    reading_time?: number
    created_at: string
}

const ITEMS_PER_PAGE = 10

/**
 * More From Bargainly Component
 * Displays a paginated list of articles with sidebar ads
 * - 3/4 width for articles
 * - 1/4 width for ads
 */
export function MoreFromBargainly() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalArticles, setTotalArticles] = useState(0)

    useEffect(() => {
        // Fetch articles from backend API
        fetch(`http://localhost:3001/api/v1/guides?status=published&limit=100`)
            .then(res => res.json())
            .then(data => {
                const articlesArray = Array.isArray(data) ? data : []
                setArticles(articlesArray)
                setTotalArticles(articlesArray.length)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to fetch articles:', err)
                setArticles([])
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <section className="py-12 bg-neutral-50">
                <Container>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                        <div className="flex gap-8">
                            <div className="flex-1 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="shrink-0 w-64 h-40 bg-gray-200 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                            <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="w-[250px] shrink-0">
                                <div className="h-[250px] bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        )
    }

    if (articles.length === 0) {
        return null
    }

    // Calculate pagination
    const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentArticles = articles.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Scroll to top of section
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <section className="py-12 bg-neutral-50">
            <Container>
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">More from Bargainly</h2>
                </div>

                {/* Two Column Layout: Articles (flex) + Ads (300px, right-aligned) */}
                <div className="flex gap-8 justify-between">
                    {/* Articles Column - takes available space */}
                    <div className="flex-1 max-w-[calc(100%-300px-2rem)]">
                        {/* Articles List */}
                        <div className="space-y-6 mb-8">
                            {currentArticles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/guides/${article.slug}`}
                                    className="group flex gap-4 overflow-hidden"
                                >
                                    {/* Article Image */}
                                    <div className="shrink-0 w-64 h-40 rounded-lg overflow-hidden bg-neutral-300">
                                        {article.featured_image ? (
                                            <img
                                                src={article.featured_image}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                                                <span className="text-sm text-neutral-400">No image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Article Content */}
                                    <div className="flex-1 min-w-0 max-w-2xl">
                                        {/* Category Badge */}
                                        <div className="mb-2">
                                            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                                                {article.category}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-900 transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>

                                        {/* Excerpt */}
                                        {article.excerpt && (
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                                {article.excerpt}
                                            </p>
                                        )}

                                        {/* Reading Time */}
                                        {article.reading_time && (
                                            <div className="text-sm text-gray-600">
                                                {article.reading_time} minutes read
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Previous page"
                                >
                                    <AltArrowLeft size={20} />
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current
                                    const showPage =
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)

                                    if (!showPage) {
                                        // Show ellipsis
                                        if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-2 text-neutral-400">...</span>
                                        }
                                        return null
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${currentPage === page
                                                ? 'bg-primary-900 text-white'
                                                : 'border border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                })}

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Next page"
                                >
                                    <AltArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Ads Sidebar - Fixed 300px width, right-aligned */}
                    <div className="w-[300px] shrink-0">
                        <SidebarAds />
                    </div>
                </div>
            </Container>
        </section>
    )
}
