'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Chart, User, Folder, Document, Bag, Settings } from '@solar-icons/react'

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', Icon: Chart },
    { name: 'Users', href: '/admin/settings?tab=users', Icon: User },
    { name: 'Categories', href: '/admin/categories', Icon: Folder },
    { name: 'Guides', href: '/admin/guides', Icon: Document },
    { name: 'Products', href: '/admin/products', Icon: Bag },
    { name: 'Settings', href: '/admin/settings', Icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-18">
                <div className="flex flex-col grow overflow-y-auto" style={{ backgroundColor: 'var(--neutral-200)' }}>
                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const IconComponent = item.Icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center px-3 py-2 text-sm text-neutral-900 font-medium rounded-md transition"
                                    style={{
                                        backgroundColor: isActive ? 'var(--neutral-50)' : 'transparent',
                                        color: isActive ? 'var(--neutral-900)' : 'var(--neutral-900)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'var(--neutral-600)'
                                            e.currentTarget.style.color = 'white'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                            e.currentTarget.style.color = 'var(--neutral-900)'
                                        }
                                    }}
                                >
                                    <IconComponent size={20} weight="Bold" className="mr-3" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile Sidebar - TODO: Add mobile menu toggle */}
        </>
    )
}
