'use client'

import { useState, useEffect } from 'react'
import { AltArrowDown } from '@solar-icons/react'

interface Category {
    id: string
    name: string
    level: number
    parent_id: string | null
}

interface CategorySelectorProps {
    value: string
    onChange: (categoryId: string) => void
    required?: boolean
}

export default function CategorySelector({ value, onChange, required = false }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:3001/api/v1/categories')
            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }
            const data = await response.json()
            setCategories(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    // Group categories by parent
    const level1Categories = categories.filter(cat => cat.level === 1)
    const level2Categories = categories.filter(cat => cat.level === 2)

    // Build nested structure for display
    const nestedOptions: Array<{ id: string; name: string; isChild: boolean }> = []

    level1Categories.forEach(parent => {
        nestedOptions.push({ id: parent.id, name: parent.name, isChild: false })

        // Add children under this parent
        const children = level2Categories.filter(child => child.parent_id === parent.id)
        children.forEach(child => {
            nestedOptions.push({ id: child.id, name: `— ${child.name}`, isChild: true })
        })
    })

    if (loading) {
        return (
            <div className="relative">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category {required && <span className="text-red-500">*</span>}
                </label>
                <div className="block w-full rounded-lg border border-neutral-200 py-1 px-4 text-neutral-500">
                    Loading categories...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="relative">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category {required && <span className="text-red-500">*</span>}
                </label>
                <div className="block w-full rounded-lg border border-red-200 py-1 px-4 text-red-500 text-sm">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    required={required}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pl-4 pr-10 py-1 text-neutral-900 appearance-none bg-white"
                >
                    <option value="">Select category</option>
                    {nestedOptions.map(option => (
                        <option
                            key={option.id}
                            value={option.id}
                            className={option.isChild ? 'pl-4' : ''}
                        >
                            {option.name}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <AltArrowDown className="h-5 w-5 text-neutral-400" />
                </div>
            </div>
        </div>
    )
}
