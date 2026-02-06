# 🚨 CRITICAL SECURITY FIXES - Implementation Guide

## PRIORITY 1: JWT Authentication Implementation

### Step 1: Install Dependencies
```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### Step 2: Add Environment Variables
Add to `.env.local`:
```env
JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this-in-production
```

### Step 3: Update `src/lib/auth.ts`
```typescript
import { cookies } from 'next/headers';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { logger } from '@/lib/logger';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

interface TokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const verifyAuth = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token');

    if (!token) {
        return null;
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token.value, JWT_SECRET) as TokenPayload;
        
        // Fetch user from database
        const users = await db.select()
          .from(mppscUsers)
          .where(eq(mppscUsers.id, decoded.userId))
          .limit(1);
        
        const user = users[0];
        
        // Verify role matches
        if (user && user.role !== decoded.role) {
          logger.warn('Role mismatch in token', { userId: decoded.userId });
          return null;
        }
        
        return user || null;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          logger.warn("Invalid JWT token:", error.message);
        } else if (error instanceof jwt.TokenExpiredError) {
          logger.warn("JWT token expired");
        } else {
          logger.error("Auth verification failed:", error);
        }
        return null;
    }
});

export function createAuthToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}
```

### Step 4: Update Login Route
Update `src/app/api/auth/mppsc-login/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { createAuthToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Verify user against mppsc_users table
    const users = await db.select().from(mppscUsers).where(eq(mppscUsers.email, email)).limit(1);
    const user = users[0];

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = createAuthToken(user.id, user.role || 'guest');

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('mppsc_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'strict' // Changed from 'lax' to 'strict'
    });

    return NextResponse.json({ 
        success: true, 
        user: { 
            email: user.email, 
            name: user.name,
            is_subscribed: user.isSubscribed,
            plan_tier: user.planTier,
            role: user.role
        } 
    });
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## PRIORITY 2: Admin Route Protection

### Step 1: Create Middleware
Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('mppsc_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/app', request.url));
      }
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect authenticated routes
  if (pathname.startsWith('/app') || pathname.startsWith('/tests')) {
    const token = request.cookies.get('mppsc_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/app/:path*', '/tests/:path*']
};
```

---

## PRIORITY 3: Rate Limiting with Upstash

### Step 1: Setup Upstash Redis (Free Tier)
1. Go to https://upstash.com/
2. Create free account
3. Create Redis database
4. Copy credentials

### Step 2: Install Dependencies
```bash
npm install @upstash/redis @upstash/ratelimit
```

### Step 3: Add to `.env.local`
```env
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

### Step 4: Create Rate Limit Utility
Update `src/lib/rate-limit.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client
const redis = Redis.fromEnv();

// Create rate limiters for different use cases
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  analytics: true,
  prefix: "@upstash/ratelimit/login",
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"), // 50 requests per minute
  analytics: true,
  prefix: "@upstash/ratelimit/api",
});

export const signupRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 signups per hour per IP
  analytics: true,
  prefix: "@upstash/ratelimit/signup",
});

// Helper to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || "unknown";
}
```

### Step 5: Apply to Login Route
Update `src/app/api/auth/mppsc-login/route.ts`:

```typescript
import { loginRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit check
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = await loginRateLimit.limit(ip);

    if (!success) {
      const resetDate = new Date(reset);
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          resetAt: resetDate.toISOString()
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }

    // ... rest of login logic
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## PRIORITY 4: Remove Database Files from Git

### Step 1: Update .gitignore
```bash
# Add to .gitignore
echo "" >> .gitignore
echo "# Database files" >> .gitignore
echo "*.db" >> .gitignore
echo "*.db-shm" >> .gitignore
echo "*.db-wal" >> .gitignore
echo "local*.db" >> .gitignore
echo "syllabus_core.db" >> .gitignore
```

### Step 2: Remove from Git History
```bash
# Remove files from git tracking
git rm --cached *.db
git rm --cached local_mppsc.db
git rm --cached syllabus_core.db

# Commit the changes
git commit -m "chore: remove database files and update gitignore"

# Optional: Clean git history (if sensitive data was committed)
# WARNING: This rewrites history - coordinate with team first
git filter-branch --tree-filter 'rm -f *.db' HEAD
git push --force
```

---

## PRIORITY 5: Add Missing Database Indexes

### Step 1: Create Migration File
Create `drizzle/migrations/add_performance_indexes.sql`:

```sql
-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON mppsc_users(email);
CREATE INDEX IF NOT EXISTS idx_tests_slug ON tests(slug);
CREATE INDEX IF NOT EXISTS idx_tests_type_ispro ON tests(type, is_pro);
CREATE INDEX IF NOT EXISTS idx_tests_type_order ON tests(type, display_order);
CREATE INDEX IF NOT EXISTS idx_user_attempts_score ON user_attempts(user_id, is_completed, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_test_rank ON test_leaderboard(test_id, rank);
```

### Step 2: Run Migration
```bash
npm run db:push
```

---

## PRIORITY 6: Environment Variable Validation

### Step 1: Create Validation File
Create `src/lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Rate Limiting (optional in development)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

// Validate and export
export const env = envSchema.parse(process.env);

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
```

### Step 2: Import Early
In `src/db/index.ts`, import at the top:

```typescript
import { env } from '@/lib/env'; // This will validate on app start

const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;
```

---

## TESTING CHECKLIST

After implementing fixes, test:

### Authentication:
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials fails
- [ ] JWT token is set correctly in cookie
- [ ] Protected routes redirect to login
- [ ] Admin routes require admin role
- [ ] Token expiration works (test with short expiry)

### Rate Limiting:
- [ ] Login rate limit triggers after 5 attempts
- [ ] Rate limit resets after timeout
- [ ] Different IPs have separate limits

### Security:
- [ ] Cannot access admin panel without admin role
- [ ] Cannot forge JWT token (try modifying cookie)
- [ ] Database files not in git
- [ ] Sensitive env vars not exposed to client

### Performance:
- [ ] Page loads under 2 seconds
- [ ] Database queries use indexes (check with EXPLAIN)
- [ ] No N+1 query issues

---

## DEPLOYMENT CHECKLIST

Before deploying to production:

1. **Environment Variables:**
   ```bash
   # Vercel CLI
   vercel env add JWT_SECRET production
   vercel env add UPSTASH_REDIS_REST_URL production
   vercel env add UPSTASH_REDIS_REST_TOKEN production
   ```

2. **Database Backup:**
   ```bash
   # Backup Turso database before migration
   turso db shell your-db-name "VACUUM INTO 'backup.db'"
   ```

3. **Build Test:**
   ```bash
   npm run build
   npm run start
   # Test all critical flows
   ```

4. **Security Headers:**
   Add to `next.config.ts`:
   ```typescript
   async headers() {
     return [
       {
         source: '/:path*',
         headers: [
           {
             key: 'X-Frame-Options',
             value: 'DENY',
           },
           {
             key: 'X-Content-Type-Options',
             value: 'nosniff',
           },
           {
             key: 'Referrer-Policy',
             value: 'origin-when-cross-origin',
           },
         ],
       },
     ];
   },
   ```

---

## MONITORING SETUP (Optional but Recommended)

### Sentry for Error Tracking:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Vercel Analytics:
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## ESTIMATED TIME TO IMPLEMENT

- **JWT Authentication:** 2-3 hours
- **Admin Protection:** 1 hour
- **Rate Limiting:** 2 hours (including Upstash setup)
- **Database Cleanup:** 30 minutes
- **Database Indexes:** 30 minutes
- **Testing:** 2-3 hours

**Total:** 1-2 days of focused work

---

## SUPPORT

If you encounter issues:
1. Check error logs in Vercel dashboard
2. Test locally first with `npm run dev`
3. Use Turso CLI to verify database changes
4. Check JWT debugger: https://jwt.io/

Good luck! 🚀
