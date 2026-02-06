
import { unstable_cache } from 'next/cache';

// "Bhai, ye data roz roz change nahi hota, isko fridge mein rakh dete hain 7 din ke liye"
export const CACHE_TAGS = {
    TESTS: 'tests',
    QUESTIONS: 'questions',
    SYLLABUS: 'syllabus'
};

export const REVALIDATE_TIME = 60 * 60 * 24 * 7; // 7 Days

// Generic cache wrapper
// Ab hum args bhi pass kar sakte hain generic tareeke se
export const cachedData = <T, Args extends any[]>(
    fetcher: (...args: Args) => Promise<T>,
    keys: string[],
    tags: string[]
) => {
    return unstable_cache(
        fetcher,
        keys,
        {
            revalidate: REVALIDATE_TIME,
            tags: tags
        }
    );
};
