'use client'

import { useSession } from 'next-auth/react'
import StatsCard from '../../components/dashboard/StatsCard'
import { User, Document, Bag, Folder, AddCircle, Chart } from '@solar-icons/react'


export default function DashboardPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                    Welcome back, {session?.user?.name || 'Admin'}!
                </h1>
                <p className="mt-2 text-neutral-600">
                    Here's what's happening with your platform today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Users"
                    value="0"
                    icon={User}
                    trend="+0%"
                    trendUp={true}
                />
                <StatsCard
                    title="Guides"
                    value="0"
                    icon={Document}
                    trend="+0%"
                    trendUp={true}
                />
                <StatsCard
                    title="Products"
                    value="0"
                    icon={Bag}
                    trend="+0%"
                    trendUp={false}
                />
                <StatsCard
                    title="Categories"
                    value="0"
                    icon={Folder}
                    trend="+0%"
                    trendUp={true}
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left">
                        <Document size={32} weight="Bold" className="mb-2 text-neutral-700" />
                        <div className="font-medium text-neutral-900">Create Guide</div>
                        <div className="text-sm text-neutral-500">Write a new shopping guide</div>
                    </button>
                    <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left">
                        <Bag size={32} weight="Bold" className="mb-2 text-neutral-700" />
                        <div className="font-medium text-neutral-900">Add Product</div>
                        <div className="text-sm text-neutral-500">Add a new product</div>
                    </button>
                    <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left">
                        <Folder size={32} weight="Bold" className="mb-2 text-neutral-700" />
                        <div className="font-medium text-neutral-900">New Category</div>
                        <div className="text-sm text-neutral-500">Create a category</div>
                    </button>
                    <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left">
                        <AddCircle size={32} weight="Bold" className="mb-2 text-neutral-700" />
                        <div className="font-medium text-neutral-900">Add User</div>
                        <div className="text-sm text-neutral-500">Invite a team member</div>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Recent Activity</h2>
                <div className="text-center py-12 text-neutral-500">
                    <Chart size={48} weight="Bold" className="mx-auto mb-2 text-neutral-400" />
                    <p>No recent activity to display</p>
                </div>
            </div>
        </div>
    )
}
