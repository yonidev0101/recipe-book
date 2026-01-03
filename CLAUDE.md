# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hebrew recipe management website built with Next.js 14+, featuring RTL (right-to-left) layout, offline support, and Supabase backend integration. Originally created with v0.app and automatically synced to this repository.

## Tech Stack

- **Framework**: Next.js 14+ with App Router, Server Components, and Server Actions
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL)
- **Image Storage**: Cloudinary (primary) and Supabase Storage
- **Styling**: Tailwind CSS + shadcn/ui components (New York style)
- **Animations**: Framer Motion
- **Package Manager**: pnpm (lock file present)
- **RTL Support**: Hebrew language with `dir="rtl"` set in root layout

## Development Commands

Since this project lacks scripts in package.json, use standard Next.js commands directly:

```bash
# Install dependencies
pnpm install

# Development server
pnpm next dev

# Build for production
pnpm next build

# Start production server
pnpm next start

# Type checking
pnpm tsc --noEmit
```

Note: The project has `ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` in next.config.mjs, so type errors won't block builds.

## Environment Variables

Required environment variables (referenced in code):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Architecture

### Database Schema (Supabase)

The app uses a normalized relational schema:

- **recipes**: Core recipe table with basic info (title, description, category_id, prep_time, servings, difficulty, image)
- **categories**: Recipe categories (linked via category_id foreign key)
- **ingredients**: One-to-many relationship with recipes (ordered by order_num)
- **instructions**: One-to-many relationship with recipes (ordered by order_num)
- **tips**: One-to-many relationship with recipes (ordered by order_num)
- **tags**: Tag definitions
- **recipe_tags**: Many-to-many junction table between recipes and tags

### Data Flow Pattern

1. **Server Components** (pages in `app/`) call Server Actions from `app/actions/recipes.ts`
2. **Server Actions** interact with Supabase using `lib/supabase/server.ts` (server client) or `lib/supabase/client.ts` (browser client)
3. **Type Safety**: All database types are auto-generated in `lib/supabase/database.types.ts`
4. **Revalidation**: Server Actions use `revalidatePath()` to update cached data after mutations

### Image Management

Dual image storage system:

- **Cloudinary** (`lib/cloudinary.ts`): Primary image storage with automatic optimization (max width 1200px, auto quality)
  - Server-side only (uses API key/secret)
  - `uploadToCloudinary(file)`: Uploads with transformations
  - `deleteFromCloudinary(url)`: Removes images by extracting public_id from URL

- **Supabase Storage** (`lib/supabase/storage.ts`): Alternative/fallback storage
  - Stores in `images` bucket under `recipe-images/` folder
  - UUID-based filenames

### Offline Support

- **Hook**: `hooks/use-offline.ts` manages online/offline state and queues actions
- **localStorage**: Pending actions stored locally and synced when connection restored
- **Retry Logic**: Failed actions retry up to 3 times
- **UI Feedback**: `components/offline-indicator.tsx` shows connection status

### Component Organization

- **Page Components** (`app/`): Server Components that fetch data and handle routing
- **UI Components** (`components/`): Client and Server Components for UI elements
- **Loading States** (`components/loading/`): Skeleton components for all major views
- **Forms**: Multiple recipe form variants (`recipe-form.tsx`, `recipe-form-redesigned.tsx`, `recipe-form-offline.tsx`)

### Key Patterns

1. **Search Implementation**: Multi-table search across recipes, ingredients, instructions, tips, and tags (see `app/actions/recipes.ts:10-150`)
   - Uses Supabase `.ilike()` for case-insensitive matching
   - Merges and deduplicates results from all tables

2. **Client Singleton**: `lib/supabase/client.ts` uses singleton pattern to prevent multiple Supabase instances

3. **Path Aliases**: Uses `@/` prefix for imports (configured in `tsconfig.json` and `components.json`)

4. **RTL Layout**: Root layout sets `lang="he"` and `dir="rtl"` for Hebrew right-to-left support

5. **Theme System**: `next-themes` with light/dark mode toggle (`components/mode-toggle.tsx`)

## Important Files

- `app/actions/recipes.ts`: All Server Actions for CRUD operations and search
- `lib/supabase/database.types.ts`: Auto-generated TypeScript types from Supabase schema
- `lib/types.ts`: Application-level TypeScript interfaces (Recipe, Category, RecipeFormData)
- `app/layout.tsx`: Root layout with RTL configuration and theme provider
- `lib/data.ts`: Sample/mock data (may be used for seeding or fallback)

## Vercel Deployment

Project is configured for automatic Vercel deployment. Changes pushed to this repository are auto-deployed. The project was created via v0.app and syncs automatically.

## Working with This Codebase

### Adding a New Recipe Field

1. Update Supabase schema (add column to `recipes` table)
2. Regenerate `lib/supabase/database.types.ts` (use Supabase CLI: `supabase gen types typescript`)
3. Update `lib/types.ts` interfaces (Recipe, RecipeFormData)
4. Modify Server Actions in `app/actions/recipes.ts` to handle the new field
5. Update form components (`components/recipe-form*.tsx`)
6. Update display components (`components/recipe-detail.tsx`, `components/recipe-card.tsx`)

### Search Functionality

To understand or modify search, start at `app/actions/recipes.ts:getRecipes()`. The function:
- Searches across 5 different tables
- Uses `.ilike()` for partial matching
- Extracts nested recipe data from junction tables
- Merges results and removes duplicates by recipe ID

### Image Upload Flow

1. User selects file in `components/image-upload.tsx`
2. Form submission calls Server Action with File object
3. Server Action calls `uploadToCloudinary()` from `lib/cloudinary.ts`
4. Cloudinary URL is stored in database
5. When recipe is deleted, `deleteFromCloudinary()` removes the image

### Debugging Offline Features

Use `hooks/use-offline.ts` to inspect:
- `pendingActions` array: queued offline operations
- localStorage key: `"offline-actions"`
- Retry logic: check `retryCount` field (max 3)
