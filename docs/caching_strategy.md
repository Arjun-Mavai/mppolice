# Caching Strategy & Architecture

This document explains the centralized caching system used in the application to ensure high performance and data consistency.

## 1. Centralized Utility (`src/lib/cache.ts`)

We use a wrapper around Next.js `unstable_cache` to enforce consistent caching policies.

```typescript
import { cachedData, CACHE_TAGS } from '@/lib/cache';

// Usage Example
export const getSyllabus = cachedData(
    async (unitId: string) => {
        return await db.query... // Expensive DB Call
    },
    ['key-name'],          // Unique Cache Key
    [CACHE_TAGS.SYLLABUS]  // Invalidation Tags
);
```

### Configuration

- **Default Duration**: 7 Days (`60 * 60 * 24 * 7`)
- **Location**: `src/lib/cache.ts`

## 2. Invalidation Strategy (How to clear cache)

We use **Tag-Based Revalidation**. Instead of clearing specific keys, we clear "tags" (groups of data).

### A. Automatic Invalidation (Event-Based)

When critical actions happen, we purge relevant tags immediately.

**Example: Test Submission**
File: `src/features/tests/actions/submission.ts`

```typescript
import { revalidateTag } from 'next/cache';

// Inside submitTestAttempt
await db.insert(userAttempts)...;

// 🚀 Boom! Clear analytics cache for this user instantly
await revalidateTag(`analytics-${userId}`);
```

### B. Manual Invalidation (API)

You can manually purge cache via a secured API endpoint.

**Endpoint**: `GET /api/revalidate?tag={tagName}&secret={token}`
**File**: `src/app/api/revalidate/route.ts`

#### Common Tags

- `syllabus` - Clear all syllabus data
- `tests` - Clear list of tests
- `analytics-{userId}` - Clear specific user's stats

## 3. Best Practices

1.  **Read Operations**: Always wrap DB fetches with `cachedData`.
2.  **Write Operations**: Always call `revalidateTag` after `insert/update/delete`.
3.  **User Specific Data**: Use dynamic tags like `analytics-${userId}` to avoid clearing global cache for one user's action.

## 4. Why this approach?

- **Speed**: Static data (Syllabus, Blogs) loads instantly from RAM/Disk.
- **Freshness**: User interaction (Tests) triggers instant updates.
- **Safety**: `cachedData` is type-safe and supports arguments.
