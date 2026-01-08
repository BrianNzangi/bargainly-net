'use client'

import { useSession, signOut } from 'next-auth/react'

export default function AdminHeader() {
    const { data: session } = useSession()

    return (
        <header className="fixed top-0 left-0 right-0 bg-neutral-800 shadow-sm z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-50">Bargainly Admin</h1>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* User Info */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-neutral-50">
                                    {session?.user?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-neutral-300">
                                    {session?.user?.email || ''}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--primary-800)' }}>
                                {session?.user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => signOut({ callbackUrl: '/role/access' })}
                            className="px-4 py-2 text-sm font-medium text-neutral-50 bg-neutral-700 border border-neutral-600 rounded-md hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
