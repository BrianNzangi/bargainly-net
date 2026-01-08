'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import AdminHeader from '../components/AdminHeader'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/role/access')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-neutral-100">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Header - Full Width */}
            <AdminHeader />

            {/* Main Content */}
            <div className="lg:pl-64 pt-20">
                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
