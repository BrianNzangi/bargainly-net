import { ComponentType } from 'react'
import type { IconWeight } from '@solar-icons/react'

interface StatsCardProps {
    title: string
    value: string
    icon: ComponentType<{ size?: number; className?: string; weight?: IconWeight }>
    trend: string
    trendUp: boolean
}

export default function StatsCard({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-neutral-900">{value}</p>
                    <div className="mt-2 flex items-center">
                        <span
                            className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {trendUp ? '↑' : '↓'} {trend}
                        </span>
                        <span className="ml-2 text-sm text-neutral-500">from last month</span>
                    </div>
                </div>
                <Icon size={40} weight="Bold" className="text-neutral-400" />
            </div>
        </div>
    )
}
