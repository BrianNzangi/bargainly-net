'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '../public/Container'
import { ArrowRight } from '@solar-icons/react'

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string
    featured_image: string | null
    category: string
    collection?: string
    reading_time?: number
    created_at: string
}

interface HomepageCollectionsProps {
    collection: 'smart-homes' | 'gaming' | 'deals' | 'tech' | 'health'
    title: string
    backgroundColor?: 'white' | 'neutral'
}

const COLLECTION_CONFIG = {
    'smart-homes': {
        title: 'Smart Homes',
        link: '/guides?collection=smart-homes'
    },
    'gaming': {
        title: 'Gaming',
        link: '/guides?collection=gaming'
    },
    'deals': {
        title: 'Deals',
        link: '/guides?collection=deals'
    },
    'tech': {
        title: 'Tech',
        link: '/guides?collection=tech'
    },
    'health': {
        title: 'Health',
        link: '/guides?collection=health'
    }
}

/**
 * Homepage Collections Component
 * Displays a horizontal scrollable list of articles for a specific collection
 */
export function HomepageCollections({
    collection,
    title,
    backgroundColor = 'white'
}: HomepageCollectionsProps) {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    const config = COLLECTION_CONFIG[collection]
    const displayTitle = title || config.title

    useEffect(() => {
        // Fetch articles for this collection from the backend API
        fetch(`http://localhost:3001/api/v1/guides?collection=${collection}&limit=4&status=published`)
            .then(res => res.json())
            .then(data => {
                // Filter client-side as well to ensure only guides with this collection are shown
                const filtered = Array.isArray(data)
                    ? data.filter(guide => guide.collection === collection)
                    : []
                setArticles(filtered)
                setLoading(false)
            })
            .catch(err => {
                console.error(`Failed to fetch ${collection} articles:`, err)
                setArticles([])
                setLoading(false)
            })
    }, [collection])

    // Don't show loading state or empty section - just hide it completely
    if (loading || articles.length === 0) {
        return null
    }

    return (
        <section className={`py-12 ${backgroundColor === 'neutral' ? 'bg-neutral-50' : 'bg-white'}`}>
            <Container>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
                    <Link
                        href={config.link}
                        className="flex items-center gap-1 text-sm font-semibold text-primary-900 hover:text-primary-700 transition-colors group"
                    >
                        See more
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/guides/${article.slug}`}
                            className="group bg-white overflow-hidden"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-neutral-300">
                                {article.featured_image ? (
                                    <img
                                        src={article.featured_image}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                                        <span className="text-sm text-neutral-400">No image</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="py-4">
                                {/* Category Badge */}
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                                        {article.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-900 transition-colors line-clamp-2">
                                    {article.title}
                                </h3>

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
            </Container>
        </section>
    )
}
