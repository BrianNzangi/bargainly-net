# Admin Components

This directory contains all reusable components for the admin panel. Components are organized by context to make them easier to maintain and locate.

## Directory Structure

```
components/
├── README.md                 # This file
├── AdminHeader.tsx          # Global: Admin panel header with user info
├── AdminSidebar.tsx         # Global: Admin navigation sidebar
├── dashboard/               # Dashboard-related components
│   └── StatsCard.tsx        # Statistics display card
└── settings/                # Settings-related components
    └── ApiIntegrationCard.tsx  # API integration configuration card
```

## Organization Guidelines

### 1. **Global Components** (Root Level)
Place components used across multiple admin sections at the root level:
- `AdminHeader.tsx` - Header component
- `AdminSidebar.tsx` - Navigation sidebar
- Common UI elements (buttons, modals, etc.)

### 2. **Context-Specific Components** (Subdirectories)
Create subdirectories for components specific to a particular context:

- **`settings/`** - Settings page components
  - `ApiIntegrationCard.tsx` - API integration configuration card
  
- **`dashboard/`** - Dashboard-specific components
  - `StatsCard.tsx` - Statistics display card
  - (Future: charts, widgets, etc.)

- **`users/`** - User management components
  - (Future: UserTable, UserForm, etc.)

- **`products/`** - Product management components
  - (Future: ProductCard, ProductForm, etc.)

- **`guides/`** - Guide management components
  - (Future: GuideEditor, GuideList, etc.)

### 3. **Naming Conventions**

- **PascalCase** for component files: `ApiIntegrationCard.tsx`
- **Descriptive names** that indicate purpose: `ApiIntegrationCard` not `Card`
- **Context prefix** when needed: `SettingsModal`, `DashboardWidget`

### 4. **When to Create a New Subdirectory**

Create a new context subdirectory when:
- You have 2+ components specific to that context
- The components are only used in that section
- You want to keep related components together

### 5. **Component File Structure**

Each component should:
```typescript
'use client' // If using client-side features

import { ... } from '@solar-icons/react'

interface ComponentNameProps {
    // Props definition
}

export default function ComponentName({ ...props }: ComponentNameProps) {
    // Component logic
    return (
        // JSX
    )
}
```

## Examples

### Adding a New Settings Component
```bash
# Create in settings subdirectory
frontend/app/admin/components/settings/SettingsModal.tsx
```

### Adding a New Global Component
```bash
# Create at root level
frontend/app/admin/components/GlobalNotification.tsx
```

### Adding Components for a New Section
```bash
# Create new subdirectory
frontend/app/admin/components/analytics/
frontend/app/admin/components/analytics/AnalyticsChart.tsx
frontend/app/admin/components/analytics/MetricsCard.tsx
```

## Import Examples

```typescript
// Global component
import AdminHeader from '@/app/admin/components/AdminHeader'

// Context-specific component
import ApiIntegrationCard from '@/app/admin/components/settings/ApiIntegrationCard'
```

## Best Practices

1. **Keep components focused** - Each component should have a single responsibility
2. **Make components reusable** - Use props for customization
3. **Document complex components** - Add comments for non-obvious logic
4. **Use TypeScript** - Define proper interfaces for props
5. **Follow the design system** - Use CSS variables from `globals.css`
6. **Handle loading/error states** - Provide good UX for async operations

## Maintenance

When adding new components:
1. Determine if it's global or context-specific
2. Place in appropriate directory
3. Update this README if adding a new context directory
4. Ensure proper TypeScript types
5. Test the component thoroughly
