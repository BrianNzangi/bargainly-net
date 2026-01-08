'use client'

/**
 * Sidebar Ads Component
 * Displays advertisement placeholders in the sidebar
 * - Four 300x250 medium rectangle ads
 * - One 300x600 sticky half-page ad
 */
export function SidebarAds() {
    return (
        <aside className="space-y-4">
            {/* Four 300x250 Medium Rectangle Ads */}
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={`square-${i}`}
                    className="w-[300px] h-[250px] bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center"
                >
                    <div className="text-center text-neutral-400">
                        <div className="text-sm font-medium">Ad Space</div>
                        <div className="text-xs">300 x 250</div>
                    </div>
                </div>
            ))}

            {/* 300x600 Sticky Half-Page Ad */}
            <div className="sticky top-4">
                <div className="w-[300px] h-[600px] bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
                    <div className="text-center text-neutral-400">
                        <div className="text-sm font-medium">Ad Space</div>
                        <div className="text-xs">300 x 600</div>
                        <div className="text-xs mt-1">(Sticky)</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
