# Page Creation Guidelines

## Overview
This document outlines the standard process for creating new pages in the Languro application to ensure consistent layout, aesthetic, and user experience.

## Core Architecture

### 1. Component Modularity
*   **Location**: Create a dedicated directory for page-specific components, e.g., `src/components/[PageName]`.
*   **Structure**: Break down the page into distinct sections (e.g., `Hero.tsx`, `Problem.tsx`, `Features.tsx`).
*   **Assembly**: The main page file (e.g., `src/app/page.tsx`) should primarily act as a container that imports and stacks these section components.

### 2. Strict Theme Support (Light & Dark)
*   **Mandatory Support**: All components **MUST** support both Light and Dark modes from day one.
*   **Implementation**: Use Tailwind's `dark:` modifier for all color-dependent properties.
    *   **Backgrounds**: `bg-white dark:bg-slate-900` or `bg-slate-50 dark:bg-slate-950`.
    *   **Text**: `text-slate-900 dark:text-white` (Primary), `text-slate-600 dark:text-slate-400` (Secondary).
    *   **Borders**: `border-slate-200 dark:border-slate-800`.
*   **Default State**: Assume Light Mode is the default in code (no prefix), and use `dark:` for the override.

## Navigation & Header

*   **Header Visibility**: The Header component acts as an overlay. Ensure navigation elements (Logo, Menu Items, Auth Buttons) are visible against the underlying background of the Hero section.
    *   **Light Mode**: Text must be dark (`text-dark`) or primary color. Logo must be the colored/dark version.
    *   **Dark Mode**: Text must be white (`dark:text-white`). Logo must be the white version.
*   **Auth Elements**: Ensure user names and action buttons have sufficient contrast in both modes.

## Aesthetic Guidelines: "The Language Gym"

 Languro is **not** a game. It is a tool for serious deliberate practice.

*   **Visual Tone**: Premium, Rigorous, Analytical, Clean.
*   **Color Palette**:
    *   **Primary**: Blue (`blue-600` / `blue-500`) for action and focus.
    *   **Neutrals**: Slate (`slate-50` to `slate-950`) for a technical, modern feel.
    *   **Accents**: Use semantic colors (Green for success, Red for error, Yellow/Orange for warnings) sparingly and purposefully.
*   **Avoid**:
    *   Gamified styling (cartoony shadows, bouncy animations).
    *   Generic "SaaS" layouts without modification.
    *   Low-contrast designs that impair readability.

## Code Pattern Example

```tsx
// src/components/Languro/ExampleSection.tsx

const ExampleSection = () => {
  return (
    <section className="bg-white py-16 dark:bg-slate-900">
      <div className="container">
        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
          Rigorous Training
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-400">
          We do not simplify the complexity of language. We master it.
        </p>
      </div>
    </section>
  );
};

export default ExampleSection;
```
