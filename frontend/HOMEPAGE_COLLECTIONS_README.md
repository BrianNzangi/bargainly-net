# Homepage Collections - Refactored Implementation

This document describes the refactored homepage collections system for Bargainly.

## Overview

Instead of creating separate components for each collection category, we now use a single reusable `HomepageCollections` component that can display any collection based on props. This makes the codebase cleaner and easier to maintain.

## Components

### 1. HomepageCollections.tsx
A **single reusable component** that displays articles for any collection type.

**Props:**
- `collection`: The collection type ('smart-homes' | 'gaming' | 'deals' | 'tech' | 'health')
- `title`: Display title for the section
- `backgroundColor`: 'white' | 'neutral' for alternating backgrounds

**Features:**
- Fetches articles from `/api/guides?collection={collection}&limit=4`
- Displays 4 guides per collection
- **Only shows the collection section if guides exist** - if no guides have the collection field selected in admin, the section is hidden completely
- No loading placeholders - sections appear only when data is available
- **Responsive grid layout** - 4 columns on desktop, 2 on tablet, 1 on mobile
- Category badge (no author as requested)
- Reading time display
- Featured images with zoom animation on hover
- Simple "No image" placeholder when no featured image is available
- Responsive design

**Usage:**
```tsx
<HomepageCollections 
  collection="smart-homes" 
  title="Smart Homes" 
  backgroundColor="white" 
/>
```

### 2. MoreFromBargainly.tsx
An **independent component** that displays a list of recent articles.

**Features:**
- Fetches latest articles from `/api/guides?limit=12`
- Displays at least 10 articles
- Vertical list layout with:
  - Horizontal card layout (image on left, content on right)
  - Category badge
  - Title
  - Excerpt
  - Reading time
- "View All Articles" button at the bottom

## Guide Form Integration

Both the create and edit guide forms now include a **Homepage Collection** field in the Categorization section.

**Field Details:**
- **Label**: Homepage Collection (Optional)
- **Type**: Dropdown select
- **Options**:
  - None (default)
  - Smart Homes
  - Gaming
  - Deals
  - Tech
  - Health
- **Description**: "Select a homepage collection to feature this guide in a specific section"

**Form Locations:**
- `/admin/guides/create` - Create new guide
- `/admin/guides/[id]/edit` - Edit existing guide

## Homepage Implementation

The homepage (`app/page.tsx`) uses the components like this:

```tsx
import { PublicLayout } from "./components/public"
import { 
  Featured, 
  HomepageCollections,
  MoreFromBargainly 
} from "./components/home"

export default function Home() {
  return (
    <PublicLayout>
      <Featured />
      <HomepageCollections collection="smart-homes" title="Smart Homes" backgroundColor="white" />
      <HomepageCollections collection="gaming" title="Gaming" backgroundColor="neutral" />
      <HomepageCollections collection="deals" title="Deals" backgroundColor="white" />
      <HomepageCollections collection="tech" title="Tech" backgroundColor="neutral" />
      <HomepageCollections collection="health" title="Health" backgroundColor="white" />
      <MoreFromBargainly />
    </PublicLayout>
  );
}
```

## API Requirements

### Guide Object Structure

Each guide should include a `collection` field:

```typescript
interface Guide {
    id: string
    title: string
    slug: string
    excerpt: string
    featured_image: string | null
    category: string
    collection?: 'smart-homes' | 'gaming' | 'deals' | 'tech' | 'health'
    reading_time?: number
    created_at: string
}
```

### API Endpoints

The component expects the API to support filtering by collection:

```
GET /api/guides?collection=smart-homes&limit=4
GET /api/guides?collection=gaming&limit=4
GET /api/guides?collection=deals&limit=4
GET /api/guides?collection=tech&limit=4
GET /api/guides?collection=health&limit=4
GET /api/guides?limit=12  // For MoreFromBargainly
```

## Design Features

- **Colors**: Uses existing Bargainly brand colors (primary-900, neutral-50, etc.)
- **Typography**: Bold headings, clean sans-serif fonts
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle shadows with hover effects
- **Animations**: Smooth transitions on hover (scale, color changes)
- **No Author Display**: As requested, author information is not shown

## Files Created/Modified

**Created:**
- `app/components/home/HomepageCollections.tsx` - Single reusable collection component
- `app/components/home/MoreFromBargainly.tsx` - Independent list component

**Modified:**
- `app/components/home/index.ts` - Updated exports
- `app/page.tsx` - Updated to use new component structure
- `app/admin/guides/create/page.tsx` - Added collection field
- `app/admin/guides/[id]/edit/page.tsx` - Added collection field

**Deleted:**
- `app/components/home/SmartHomes.tsx` (replaced by HomepageCollections)
- `app/components/home/Gaming.tsx` (replaced by HomepageCollections)
- `app/components/home/Deals.tsx` (replaced by HomepageCollections)
- `app/components/home/Tech.tsx` (replaced by HomepageCollections)
- `app/components/home/Health.tsx` (replaced by HomepageCollections)

## Benefits of This Approach

1. **DRY Principle**: Single component instead of 5 duplicate components
2. **Maintainability**: Changes to the collection layout only need to be made in one place
3. **Flexibility**: Easy to add new collections by just adding a new option to the dropdown
4. **Consistency**: All collections use the same layout and behavior
5. **Database-Driven**: Collections are managed through the guide form, not hardcoded
