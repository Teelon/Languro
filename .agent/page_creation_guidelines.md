# Page Creation Guidelines

## Overview
This document outlines the standard process for creating new pages in the application to ensure consistent layout and user experience.

## Page Types

### 1. Dashboard Pages
*   **Location**: `src/app/(DashboardLayout)/...`
*   **Behavior**: Automatically inherit the Admin Dashboard layout (Sidebar, Vertical Header).
*   **Use Case**: Authenticated user features, settings, admin panels.

### 2. Public / Frontend Pages
*   **Location**: `src/app/frontend-pages/...` or root level (e.g., `src/app/conjugator/...`)
*   **Behavior**: **DO NOT** inherit a global layout automatically. You must explicitly wrap content in the Public Layout components.
*   **Use Case**: Landing pages, tools accessible to unauthenticated users, marketing pages.

## Standard Public Page Pattern

When creating a new public page, you must manually import and include the Layout components.

**Required Imports:**
```tsx
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader'; // The Public Header/Menu
import Footer from '@/app/components/frontend-pages/shared/footer'; // The Public Footer
import ScrollToTop from '@/app/components/frontend-pages/shared/scroll-to-top';
```

**Template:**
```tsx
export default function NewPublicPage() {
    return (
        <PageContainer title="Page Title" description="SEO Description">
            {/* 1. Header */}
            <HpHeader />

            {/* 2. Main Content Wrapper */}
            <Box sx={{ minHeight: 'calc(100vh - 400px)' }}> {/* Optional: Ensure footer pushes down */}
                 {/* ... Your content here ... */}
            </Box>

            {/* 3. Footer Components */}
            <Footer />
            <ScrollToTop />
        </PageContainer>
    );
}
```
