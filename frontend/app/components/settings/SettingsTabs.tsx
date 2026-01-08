'use client'

interface SettingsTabsProps {
    activeTab: 'api' | 'users' | 'system'
    onTabChange: (tab: 'api' | 'users' | 'system') => void
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
    return (
        <div className="border-b mb-6" style={{ borderColor: 'var(--neutral-300)' }}>
            <nav className="-mb-px flex space-x-8">
                <button
                    onClick={() => onTabChange('api')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'api'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                    style={{
                        color: activeTab === 'api' ? 'var(--blue-600)' : 'var(--neutral-600)',
                    }}
                >
                    API Integrations
                </button>
                <button
                    onClick={() => onTabChange('users')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'users'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                    style={{
                        color: activeTab === 'users' ? 'var(--blue-600)' : 'var(--neutral-600)',
                    }}
                >
                    Users
                </button>
                <button
                    onClick={() => onTabChange('system')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'system'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                    style={{
                        color: activeTab === 'system' ? 'var(--blue-600)' : 'var(--neutral-600)',
                    }}
                >
                    System Settings
                </button>
            </nav>
        </div>
    )
}
