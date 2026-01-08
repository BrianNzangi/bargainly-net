'use client'

import { useState, useEffect } from 'react'
import {
    MagniferZoomIn,
    CloseCircle,
    Filters,
    Widget2,
    Database,
    CheckCircle,
    DollarMinimalistic,
    AltArrowDown
} from '@solar-icons/react'

interface Category {
    id: string
    name: string
    slug: string
}

interface ProductFiltersProps {
    onFilterChange: (filters: FilterState) => void
    totalProducts: number
    filteredCount: number
}

export interface FilterState {
    search: string
    category: string
    source: string
    availability: string
    priceMin: string
    priceMax: string
}

export function ProductFilters({ onFilterChange, totalProducts, filteredCount }: ProductFiltersProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        category: '',
        source: '',
        availability: '',
        priceMin: '',
        priceMax: '',
    })

    useEffect(() => {
        // Fetch categories for filter dropdown
        fetch('http://localhost:3001/api/v1/categories')
            .then(res => res.json())
            .then(data => setCategories(data || []))
            .catch(err => console.error('Failed to fetch categories:', err))
    }, [])

    useEffect(() => {
        // Notify parent component of filter changes
        onFilterChange(filters)
    }, [filters, onFilterChange])

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            source: '',
            availability: '',
            priceMin: '',
            priceMax: '',
        })
    }

    const hasActiveFilters = Object.values(filters).some(value => value !== '')

    return (
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 mb-6">
            {/* Filter Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            <Filters size={20} />
                            <span>Filters</span>
                            {hasActiveFilters && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-900">
                                    Active
                                </span>
                            )}
                        </button>

                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">{filteredCount}</span> of{' '}
                            <span className="font-medium text-gray-900">{totalProducts}</span> products
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            <CloseCircle size={16} />
                            Clear all filters
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar - Always Visible */}
            <div className="px-6 py-4">
                <div className="relative">
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Search products by name or brand..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <MagniferZoomIn size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    {filters.search && (
                        <button
                            onClick={() => handleFilterChange('search', '')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <CloseCircle size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showFilters && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Widget2 size={16} className="text-gray-500" />
                                Category
                            </label>
                            <div className="relative">
                                <Widget2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="">All Categories</option>
                                    {categories
                                        .filter(cat => cat.name) // Only show categories with names
                                        .map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                </select>
                                <AltArrowDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Source Filter */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Database size={16} className="text-gray-500" />
                                Source
                            </label>
                            <div className="relative">
                                <Database size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select
                                    value={filters.source}
                                    onChange={(e) => handleFilterChange('source', e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="">All Sources</option>
                                    <option value="amazon">Amazon</option>
                                    <option value="manual">Manual</option>
                                    <option value="awin">AWIN</option>
                                    <option value="cj">CJ</option>
                                    <option value="impact">Impact</option>
                                </select>
                                <AltArrowDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Availability Filter */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <CheckCircle size={16} className="text-gray-500" />
                                Availability
                            </label>
                            <div className="relative">
                                <CheckCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select
                                    value={filters.availability}
                                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="">All Status</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                                <AltArrowDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <DollarMinimalistic size={16} className="text-gray-500" />
                                Price Range
                            </label>
                            <div className="flex gap-2">
                                <div className="relative w-1/2">
                                    <DollarMinimalistic size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="number"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                        placeholder="Min"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="relative w-1/2">
                                    <DollarMinimalistic size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="number"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                        placeholder="Max"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                                {filters.search && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-300">
                                        Search: {filters.search}
                                        <button
                                            onClick={() => handleFilterChange('search', '')}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <CloseCircle size={14} />
                                        </button>
                                    </span>
                                )}
                                {filters.category && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-300">
                                        Category: {categories.find(c => c.id === filters.category)?.name}
                                        <button
                                            onClick={() => handleFilterChange('category', '')}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <CloseCircle size={14} />
                                        </button>
                                    </span>
                                )}
                                {filters.source && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-300">
                                        Source: {filters.source}
                                        <button
                                            onClick={() => handleFilterChange('source', '')}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <CloseCircle size={14} />
                                        </button>
                                    </span>
                                )}
                                {filters.availability && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-300">
                                        Status: {filters.availability}
                                        <button
                                            onClick={() => handleFilterChange('availability', '')}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <CloseCircle size={14} />
                                        </button>
                                    </span>
                                )}
                                {(filters.priceMin || filters.priceMax) && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-300">
                                        Price: {filters.priceMin || '0'} - {filters.priceMax || '∞'}
                                        <button
                                            onClick={() => {
                                                handleFilterChange('priceMin', '')
                                                handleFilterChange('priceMax', '')
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <CloseCircle size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
