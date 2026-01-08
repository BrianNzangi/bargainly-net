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
    author?: {
        name: string
        avatar?: string
    }
    reading_time?: number
    created_at: string
}

/**
 * Featured Articles Component
 * Displays a hero article on the left and a list of popular articles on the right
 */
export function Featured() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch featured articles/guides
        fetch('/api/guides?featured=true&limit=4')
            .then(res => res.json())
            .then(data => {
                setArticles(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to fetch featured articles:', err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <section className="py-12 bg-white">
                <Container>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-96 bg-gray-200 rounded-xl"></div>
                            <div className="space-y-4">
                                <div className="h-32 bg-gray-200 rounded-xl"></div>
                                <div className="h-32 bg-gray-200 rounded-xl"></div>
                                <div className="h-32 bg-gray-200 rounded-xl"></div>
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

    const heroArticle = articles[0]
    const sideArticles = articles.slice(1, 4) // Limit to 3 articles on the right

    return (
        <section className="py-12 bg-neutral-100">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Hero Article - Left Side */}
                    <div className="group relative bg-white rounded-lg shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden">
                        <Link href={`/guides/${heroArticle.slug}`} className="block">
                            {/* Image Container */}
                            <div className="relative h-72 overflow-hidden bg-neutral-300">
                                {heroArticle.featured_image ? (
                                    <img
                                        src={heroArticle.featured_image}
                                        alt={heroArticle.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-6xl opacity-20">📚</div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-3">
                                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                        Popular Articles
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-900 transition-colors line-clamp-2">
                                    {heroArticle.title}
                                </h2>

                                {/* Author & Meta Info */}
                                {heroArticle.author && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            {heroArticle.author.avatar ? (
                                                <img
                                                    src={heroArticle.author.avatar}
                                                    alt={heroArticle.author.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-primary-900">
                                                        {heroArticle.author.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900">
                                                by {heroArticle.author.name}
                                            </span>
                                        </div>
                                        {heroArticle.reading_time && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <span>{heroArticle.reading_time} minutes read</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Popular Articles List - Right Side */}
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">Popular articles</h3>
                            <Link
                                href="/guides"
                                className="flex items-center gap-1 text-sm font-semibold text-primary-900 hover:text-primary-700 transition-colors group"
                            >
                                See more popular articles
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Articles List */}
                        <div className="space-y-4">
                            {sideArticles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/guides/${article.slug}`}
                                    className="group flex gap-4"
                                >
                                    {/* Article Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1">
                                            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                                                {article.category}
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-900 transition-colors line-clamp-3">
                                            {article.title}
                                        </h4>

                                        {article.author && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <span className="font-medium text-gray-900">
                                                    by {article.author.name}
                                                </span>
                                                {article.reading_time && (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <span>{article.reading_time} minutes read</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Article Image */}
                                    <div className="shrink-0 w-58 h-30 rounded-lg overflow-hidden bg-neutral-300">
                                        {article.featured_image ? (
                                            <img
                                                src={article.featured_image}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-3xl opacity-20">📄</div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
