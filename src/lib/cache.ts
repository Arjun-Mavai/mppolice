import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

export const REVALIDATE_TIME = 60 * 60 * 24 * 7; // 7 Days (Default Long Cache)
export const SHORT_CACHE = 60 * 60; // 1 Hour (for frequently updated content)

// Centralized Cache System
// Usage:
// - Fetching: use CACHE.BLOGS.GET_ALL.tags
// - Invalidating: revalidateTag(CACHE.BLOGS.TAGS.ALL)

export const CACHE = {
    BLOGS: {
        TAGS: {
            ALL: 'blogs-list',
            DETAIL: (slug: string) => `blog-${slug}`
        },
        GET_ALL: {
            tags: ['blogs-list'],
            revalidate: SHORT_CACHE // 1 hour for blogs
        },
        GET_BY_SLUG: (slug: string) => ({
            tags: [`blog-${slug}`],
            revalidate: SHORT_CACHE // 1 hour for blog details
        })
    },
    SYLLABUS: {
        TAGS: {
            ALL: 'syllabus-topics',
            UNIT: (unitId: string) => `syllabus-unit-${unitId}`
        },
        GET_ALL: {
            tags: ['syllabus-topics'],
            revalidate: REVALIDATE_TIME
        }
    },
    TESTS: {
        TAGS: {
            ALL: 'tests-list',
            DETAIL: (id: string) => `test-${id}`,
            BY_TOPIC: (topicId: string) => `tests-topic-${topicId}`
        },
        GET_ALL: {
            tags: ['tests-list'],
            revalidate: SHORT_CACHE // 1 hour for tests
        }
    },
    ATTEMPT_LIMITS: {
        TAGS: {
            ALL: 'attempt-limits',
        },
        GET_ALL: {
            tags: ['attempt-limits'],
            revalidate: REVALIDATE_TIME
        }
    }
};

// Generic cache wrapper
export const cachedData = <T, Args extends any[]>(
    fetcher: (...args: Args) => Promise<T>,
    keys: string[],
    tags: string[],
    revalidate: number = REVALIDATE_TIME
) => {
    return unstable_cache(
        fetcher,
        keys,
        {
            revalidate: revalidate,
            tags: tags
        }
    );
};

