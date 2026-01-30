---
description: Next.js Middleware Pattern - Use proxy.ts NOT middleware.ts
---

# Next.js Middleware Pattern

> [!IMPORTANT]
> **This project uses `src/proxy.ts` for middleware logic**
> 
> - All middleware logic should be added to `src/proxy.ts`
> - `middleware.ts` exists only to re-export: `export { proxy as middleware, config } from "./src/proxy";`
> - Never add logic directly to `middleware.ts` - it's just a bridge file

## Important Rules

1. **Always use `src/proxy.ts`** for route-level authentication and redirects
2. **`middleware.ts` is only a re-export** - don't modify it directly
3. The proxy pattern is already configured with:
   - Authentication checks using `next-auth/jwt`
   - Protected route redirects
   - Auth page redirects
   - Onboarding flow management

## How to Add New Route Logic

When adding new route protection or redirect logic:

1. **Open `src/proxy.ts`**
2. **Add route patterns** to the appropriate arrays:
   - `protectedPrefixes` - Routes requiring authentication
   - `marketingPages` - Public marketing pages (redirect if authenticated)
3. **Update the `matcher` config** at the bottom to include new routes
4. **Test** the behavior for both authenticated and unauthenticated users

## Current Configuration

The proxy handles:
- **Marketing pages** → Redirect to `/dashboard` if authenticated
- **Auth pages** (`/signin`, `/signup`) → Redirect to `/dashboard` if authenticated
- **Protected routes** → Redirect to `/signin` if not authenticated
- **Onboarding flow** → Redirect based on completion status

## Example

```typescript
// Adding a new protected route:
const protectedPrefixes = [
  "/dashboard",
  "/onboarding",
  "/my-new-feature", // Add here
];

// Update matcher:
export const config = {
  matcher: [
    // ...existing routes
    "/my-new-feature/:path*", // Add here
  ],
};
```
