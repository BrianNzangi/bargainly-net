'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AddCircle, Pen, TrashBinMinimalistic } from '@solar-icons/react'

interface Guide {
    id: string
    title: string
    slug: string
    category?: string | null
    collection?: string | null
    status: 'draft' | 'published' | 'archived'
    author_name?: string | null
    is_featured: boolean
    published_at?: string | null
    created_at: string
    view_count: number
}

export default function GuidesPage() {
    const [guides, setGuides] = useState<Guide[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchGuides()
    }, [])

    const fetchGuides = async () => {
        try {
            console.log('Fetching guides from API...')
            const res = await fetch('http://localhost:3001/api/v1/guides', {
                headers: {
                    'Authorization': 'Bearer admin'
                }
            })
            console.log('Response status:', res.status)

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()
            console.log('Guides data:', data)
            setGuides(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch guides:', error)
            setGuides([])
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this guide?')) return

        try {
            await fetch(`http://localhost:3001/api/v1/guides/${id}`, {
                method: 'DELETE',
            })
            fetchGuides()
        } catch (error) {
            console.error('Failed to delete guide:', error)
            alert('Failed to delete guide')
        }
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading guides...</div>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Guides</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage your buying guides and product recommendations.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        href="/admin/guides/create"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <AddCircle className="mr-2 h-5 w-5" />
                        Create Guide
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden ring-1 ring-neutral-200 ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Title
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Category
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Author
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Published
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Views
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 bg-white">
                                    {guides.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-8 text-center text-sm text-neutral-500">
                                                No guides found. Create your first guide to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        guides.map((guide) => (
                                            <tr key={guide.id}>
                                                <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="flex items-center">
                                                        <div className="max-w-md">
                                                            <div className="font-medium text-neutral-900 line-clamp-2">
                                                                {guide.title}
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {guide.is_featured && (
                                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                                        Featured
                                                                    </span>
                                                                )}
                                                                {guide.collection && (
                                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                                        {guide.collection === 'smart-homes' ? 'Smart Homes' :
                                                                            guide.collection === 'gaming' ? 'Gaming' :
                                                                                guide.collection === 'deals' ? 'Deals' :
                                                                                    guide.collection === 'tech' ? 'Tech' :
                                                                                        guide.collection === 'health' ? 'Health' : guide.collection}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {guide.category || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${guide.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : guide.status === 'draft'
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {guide.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {guide.author_name || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {formatDate(guide.published_at)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {guide.view_count.toLocaleString()}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex justify-end space-x-2">
                                                        <Link
                                                            href={`/admin/guides/${guide.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900 p-1"
                                                        >
                                                            <Pen className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(guide.id)}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                        >
                                                            <TrashBinMinimalistic className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
