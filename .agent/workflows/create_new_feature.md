---
description: How to add a new feature using the Feature-Based Architecture
---
# Feature Development Workflow

This document outlines the standard workflow for adding new features using a **Feature-Based Architecture**. This approach colocates all logic, UI, and types for a specific feature into a single folder.

## Directory Structure

All new features should be located in `src/features/`.

### The Feature Folder
**Path**: `src/features/[feature-name]`

Inside this folder, organize files by type:
- **`components/`**: UI components specific to this feature.
- **`services/`**: Business logic, API calls, and data transformations.
- **`hooks/`** (Optional): Custom React hooks for this feature.
- **`types.ts`** (Optional): TypeScript interfaces and types for this feature.
- **`index.ts`** (Optional): Export public API of the feature.

## Integration with Next.js App Router

The `src/app` directory should remain thin and primarily handle routing.

1.  **Pages**: Import components from the feature folder.
    - `src/app/profile/page.tsx`
    ```tsx
    import { ProfileContainer } from '@/features/user-profile/components/ProfileContainer';
    ```

2.  **API Routes**: Import logic from the feature service.
    - `src/app/api/profile/route.ts`
    ```ts
    import { getProfile } from '@/features/user-profile/services/profileService';
    ```

## Workflow Steps

1.  **Create Feature Folder**: `src/features/[new-feature-name]`
2.  **Implement**: Add `components`, `services`, `types` inside that folder.
3.  **Integrate**: Import and use in `src/app/` (pages or API routes).
