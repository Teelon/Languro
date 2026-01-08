# UI & Theming Standards

## Core Principle
**"Shadcn/UI First, Theme Always."**

All UI components and refactors must strictly adhere to the following rules to ensure a consistent, premium, and theme-adaptive user experience.

## 1. Component Library: Shadcn/UI
*   **Default Library**: Always use `shadcn/ui` components located in `src/components/ui` as the primary building blocks.
*   **No Raw HTML/Tailwind for Complex Elements**: Do not build custom cards, modals, inputs, or dropdowns from scratch using raw `div` tags and Tailwind classes if a Shadcn equivalent exists.
*   **New Components**: If a required Shadcn component is missing (e.g., `tabs.tsx`), explicitly check if it exists or ask the user if it should be added/implemented before building a custom version.

## 2. Design Tokens (Theme System)
These are the verified design tokens available in `src/styles/index.css`. **ALWAYS** use these semantic classes instead of hardcoded hex values or Tailwind primitives.

### Colors
| Sematic Class | Use Case |
| :--- | :--- |
| `bg-background` / `text-foreground` | Default page background and primary text color. |
| `bg-card` / `text-card-foreground` | For cards, panels, and distinct content areas. |
| `bg-popover` / `text-popover-foreground` | For tooltips, dropdowns, and popovers. |
| `bg-primary` / `text-primary-foreground` | Main action buttons, active states, key highlights. |
| `bg-secondary` / `text-secondary-foreground` | Secondary actions, less prominent backgrounds. |
| `bg-muted` / `text-muted-foreground` | Subtitles, disabled states, weak backgrounds. |
| `bg-accent` / `text-accent-foreground` | Hover states, interactive elements. |
| `bg-destructive` / `text-destructive-foreground` | Error states, dangerous actions (delete). |
| `border-border` | Default border color for dividers and inputs. |
| `border-input` | Specific border color for form inputs. |
| `ring-ring` | Focus ring color. |

### Component-Specific Charts (Data Viz)
*   `--chart-1` ... `--chart-5`: Use these CSS variables for data visualization colors.

### Border Radius
*   `rounded-lg`: Standard radius (maps to `--radius: 0.5rem`).
*   `rounded-md`: Slightly smaller (default Tailwind).
*   `rounded-sm`: Small elements.

## 3. Theme Compatibility (Light & Dark)
*   **Semantic Colors**: Use semantic CSS variables defined in strict adherence to the Shadcn/Tailwind theme system.
    *   **Backgrounds**: Use `bg-background`, `bg-card`, `bg-muted`. Avoid hardcoded `bg-white` or `bg-slate-900`.
    *   **Text**: Use `text-foreground`, `text-card-foreground`, `text-muted-foreground`. Avoid hardcoded `text-gray-900` or `text-white`.
    *   **Borders**: Use `border-border`, `border-input`.
*   **Testing**: Assume every component will be viewed in both Light and Dark modes.
*   **Forbidden**: Do not use utility classes that fix a color to a specific mode (e.g., `bg-white`) without a corresponding `dark:` modifier, OR better yet, use the semantic class `bg-card` which handles both automatically.

## 4. Example: Refactoring a Card
**BAD (Custom Implementation):**
```tsx
<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
  <h3 className="text-gray-900 dark:text-white">Title</h3>
  <div className="text-gray-500">Content</div>
</div>
```

**GOOD (Shadcn/UI Implementation):**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content
  </CardContent>
</Card>
```

## 5. Agent Instructions
*   **Check First**: Before writing code, check `src/components/ui` for available components.
*   **Refactor**: When asked to "check UI" or "fix UI", always refactor custom implementations to standard Shadcn patterns.

## 6. Layout & Alignment Standards
*   **Consistent Spacing**: Use Tailwind's spacing scale (`gap-4`, `space-y-6`, `p-4`) consistently. Avoid arbitrary values like `gap-[13px]` unless absolutely necessary.
*   **Flexbox/Grid Defaults**: 
    *   For vertical stacks: Use `flex flex-col gap-4` (not `space-y-*` when using flex)
    *   For horizontal layouts: Use `flex items-center gap-3`
    *   For grids: Use `grid grid-cols-*` with explicit `gap-*`
*   **Alignment Rules**:
    *   Cards in a grid should have consistent heights: Add `h-full` to card components
    *   Text baselines should align: Use consistent `leading-*` classes within sections
    *   Icons and text: Always wrap in `flex items-center gap-2`
*   **Container Consistency**: Use the same container pattern across pages (e.g., `max-w-7xl mx-auto px-4`)

## 7. Custom Component Guidelines
*   **When Custom is Acceptable**: Document specific cases where custom components are needed (animations, business logic, etc.)
*   **Custom Component Checklist**:
    - [ ] Uses semantic theme tokens (`bg-card`, not `bg-white`)
    - [ ] Follows Shadcn's variant patterns if similar to existing components
    - [ ] Includes `className` prop for composition
    - [ ] Documented in `src/components/custom/README.md` (or similar)
*   **File Organization**:
```
    src/components/
      ui/          # Shadcn components only
      custom/      # Your custom components
      layout/      # Layout wrappers (if needed)
```

## 8. Common Anti-Patterns to Avoid
*   ❌ Mixing `space-y-*` with `flex-col gap-*` (they conflict)
*   ❌ Using `mt-*` for spacing between flex children (use `gap-*` instead)
*   ❌ Hardcoded z-index values (use Tailwind's scale: `z-10`, `z-20`, etc.)
*   ❌ Inline styles or arbitrary values that break theming (`style={{color: '#000'}}`)
*   ❌ Nested theme violations (a `bg-card` containing another `bg-card` without proper contrast)

## 9. Verification Checklist
Before marking UI work as complete, verify:
- [ ] Component exists in `src/components/ui` or has documented reason to be custom
- [ ] All colors use semantic tokens (check for `bg-`, `text-`, `border-`)
- [ ] Layout uses consistent spacing scale (no arbitrary `px-[17px]`)
- [ ] Tested in both light and dark mode
- [ ] No layout shift between viewport sizes (responsive test)
- [ ] Alignment verified in parent container (grid/flex inspector)

## 10. Debugging Alignment Issues
When components aren't aligning:

### Step 1: Check Flex/Grid on Parent
Inspect the parent container:
*   Is it using `flex` or `grid`?
*   Does it have `items-center`, `items-start`, or `items-stretch`?
*   For grids: Check `grid-cols-*` and whether children need `h-full`

### Step 2: Verify Child Heights
*   Cards in a grid need `h-full` to stretch to equal heights
*   Use `min-h-*` instead of fixed `h-*` when content varies
*   Check if any child has a fixed height that's breaking the layout

### Step 3: Inspect Spacing Method
*   Using `gap-*`? → Good for flex/grid
*   Using `space-y-*`? → Only for block elements, conflicts with flex
*   Using `mt-*` on children? → Replace with parent's `gap-*`

### Step 4: Common Fixes

**Problem: Cards have different heights in a grid**
```tsx
// ❌ BAD: Cards don't stretch
<div className="grid grid-cols-3 gap-4">
  <Card>Short content</Card>
  <Card>Much longer content that makes this card taller</Card>
</div>

// ✅ GOOD: Cards stretch to match
<div className="grid grid-cols-3 gap-4">
  <Card className="h-full">Short content</Card>
  <Card className="h-full">Much longer content that makes this card taller</Card>
</div>
```

**Problem: Spacing inconsistent between items**
```tsx
// ❌ BAD: Mixed spacing methods
<div className="flex flex-col space-y-4">
<Card className="mt-2">First</Card>
<Card>Second</Card>
</div>

// ✅ GOOD: Consistent spacing
<div className="flex flex-col gap-4">
<Card>First</Card>
<Card>Second</Card>
</div>
```

**Problem: Icon and text not aligned**
```tsx
// ❌ BAD: No alignment
<div>
<Icon />
<span>Text</span>
</div>

// ✅ GOOD: Centered alignment
<div className="flex items-center gap-2">
<Icon />
<span>Text</span>
</div>
```

**Problem: Content not vertically centered in container**
```tsx
// ❌ BAD: No centering
<div className="h-32">
<p>Content</p>
</div>

// ✅ GOOD: Vertically centered
<div className="h-32 flex items-center">
<p>Content</p>
</div>
```

### Step 5: Visual Debugging
When alignment issues persist:
1. Add temporary colored borders to identify containers: `className="border-2 border-red-500"`
2. Use browser DevTools to inspect flex/grid properties
3. Check for unexpected padding/margin inherited from parent components
4. Verify that wrapper divs aren't adding extra spacing

## 11. Specialized UI Patterns

### The "OR" Separator (Line with Text)
When creating a horizontal separator with text in the middle (e.g., in Auth forms), use the semantic masking pattern to ensure it works perfectly in dark mode.
*   **Standard Implementation**:
    ```tsx
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">
          OR
        </span>
      </div>
    </div>
    ```
*   **Key Learn**: Always use `bg-card` (or `bg-background`) for the span masking the line. Never use hardcoded `bg-white` or specific hex codes, as these will appear as visible boxes in Dark Mode.

## 12. Auth Page Standards
*   **Theme Accessibility**: Auth pages must include the global `Header` or at least a `ThemeToggler`. Users should be able to switch to their preferred theme (Dark/Light) *before* signing in.
*   **Visual Noise Reduction**: When refactoring from legacy templates to Shadcn, proactively remove non-functional decorative SVGs (circles, blobs, abstract backgrounds). Premium design favors clean layouts and consistent component borders over decorative "visual noise."
*   **Backgrounds**: Replace legacy hex backgrounds (e.g., `bg-[#F4F7FF]`) with semantic tokens like `bg-muted/50` or standard `bg-background`.
