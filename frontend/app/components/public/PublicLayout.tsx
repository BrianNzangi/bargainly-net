import { ReactNode } from 'react'
import { Header } from '../home/Header'

interface PublicLayoutProps {
    children: ReactNode
}

/**
 * Public Layout - wraps public-facing pages with header
 */
export function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>{children}</main>
        </div>
    )
}
