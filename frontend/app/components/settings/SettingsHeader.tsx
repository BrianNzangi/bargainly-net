'use client'

import { AddCircle } from '@solar-icons/react'

interface SettingsHeaderProps {
    activeTab: 'api' | 'users' | 'system'
    hasSettings: boolean
    onAddClick: () => void
}

export default function SettingsHeader({ activeTab, hasSettings, onAddClick }: SettingsHeaderProps) {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--neutral-900)' }}>
                    Settings
                </h1>
                <p className="mt-2 text-sm" style={{ color: 'var(--neutral-600)' }}>
                    Manage your application settings and third-party integrations
                </p>
            </div>

            {activeTab === 'api' && hasSettings && (
                <button
                    onClick={onAddClick}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition"
                    style={{ backgroundColor: 'var(--accent)' }}
                >
                    <AddCircle size={20} className="mr-2" weight="Bold" />
                    Add Another Integration
                </button>
            )}
        </div>
    )
}
