'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '../public/Container'
import { MagniferZoomIn, Bell } from '@solar-icons/react'

interface Category {
    id: string
    name: string
    slug: string
    parent_id: string | null
    level: number
}

/**
 * Public Header Component
 * Two rows: 
 * - Row 1: Logo, Search, Newsletter CTA
 * - Row 2: Category Navigation (L1 with L2 dropdowns)
 */
export function Header() {
    const [categories, setCategories] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    useEffect(() => {
        // Fetch categories from our new API
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to fetch categories:', err))
    }, [])

    // Get L1 categories (top level)
    const l1Categories = categories.filter(cat => cat.level === 1)

    // Get L2 categories for a given parent
    const getL2Categories = (parentId: string) => {
        return categories.filter(cat => cat.parent_id === parentId && cat.level === 2)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
        }
    }

    return (
        <header className="border-b bg-white">
            {/* Row 1: Logo, Search, Newsletter */}
            <div className="border-b border-neutral-100">
                <Container>
                    <div className="flex items-center justify-between py-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <img
                                src="/bargainly-net-logo.webp"
                                alt="Bargainly"
                                className="h-10 w-auto"
                            />
                        </Link>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for products, guides..."
                                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50022] focus:border-transparent"
                                />
                                <MagniferZoomIn size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </form>

                        {/* Newsletter CTA */}
                        <button className="flex items-center gap-1 px-4 py-2 bg-[#e50022] text-white rounded-lg hover:bg-[#eb3c3d] transition-colors whitespace-nowrap">
                            <Bell className="size-6 rotate-16" />
                            <span className="font-medium italic">Deals in your inbox!</span>
                        </button>
                    </div>
                </Container>
            </div>

            {/* Row 2: Category Navigation */}
            <div className="bg-neutral-50 border-b border-neutral-50">
                <Container>
                    <nav className="flex items-center gap-1 py-1">
                        {l1Categories.map((category) => {
                            const l2Categories = getL2Categories(category.id)
                            const hasDropdown = l2Categories.length > 0

                            return (
                                <div
                                    key={category.id}
                                    className="relative"
                                    onMouseEnter={() => hasDropdown && setOpenDropdown(category.id)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <Link
                                        href={`/category/${category.slug}`}
                                        className="pr-4 py-2 text-gray-700 hover:text-[#e50022] rounded-md transition-colors font-semibold flex items-center gap-1"
                                    >
                                        {category.name}
                                        {hasDropdown && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </Link>

                                    {/* L2 Dropdown */}
                                    {hasDropdown && openDropdown === category.id && (
                                        <div className="absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-xs min-w-[300px] z-50">
                                            <div className="py-2">
                                                {l2Categories.map((subCategory) => (
                                                    <Link
                                                        key={subCategory.id}
                                                        href={`/category/${subCategory.slug}`}
                                                        className="block px-4 py-2 text-gray-700 hover:bg-[#ffece9] hover:text-[#e50022] transition-colors"
                                                    >
                                                        {subCategory.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </Container>
            </div>
        </header>
    )
}
