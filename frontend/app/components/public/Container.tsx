import { ReactNode } from 'react'

interface ContainerProps {
    children: ReactNode
    className?: string
}

/**
 * Container component - wraps content with max-width of 1280px
 */
export function Container({ children, className = '' }: ContainerProps) {
    return (
        <div className={`mx-auto w-full max-w-[1440px] px-4 ${className}`}>
            {children}
        </div>
    )
}
