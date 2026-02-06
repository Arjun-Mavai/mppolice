# 🔄 COMPLETE MIGRATION SYSTEM GUIDE

> **Bhai, ab se proper professional workflow! Development → Testing → Production**

---

## 🎯 Current Situation Analysis

### What You Have Now:

```
✅ Production DB (Turso):
   - URL: libsql://mppsc-test-series-arjun-gurjar.aws-ap-south-1.turso.io
   - Live data (5-6 tables created directly)
   - Real users might be using this

✅ Local DB Files (Empty):
   - local.db
   - local_mppsc.db  
   - syllabus_core.db

⚠️  Problem:
   - No proper dev/prod separation
   - Tables created directly on prod (risky!)
   - No migration history
   - Can't rollback if something breaks
```

---

## 🏗️ RECOMMENDED SETUP (Professional Way)

### The Right Architecture:

```
┌────────────────────────────────────────────────────────────┐
│                  DATABASE WORKFLOW                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. LOCAL DEVELOPMENT (Your laptop)                        │
│     Database: local.db (SQLite file)                       │
│     Changes: Free to experiment                            │
│     Cost: FREE                                              │
│                                                             │
│  2. STAGING/TESTING (Optional - Turso free DB)            │
│     Database: Turso staging instance                       │
│     Purpose: Test before prod push                         │
│     Cost: FREE (separate Turso database)                   │
│                                                             │
│  3. PRODUCTION (Live users)                                │
│     Database: Turso prod (current one)                     │
│     Changes: Only through tested migrations                │
│     Cost: FREE tier (or paid if scaled)                    │
│                                                             │
└────────────────────────────────────────────────────────────┘

FLOW:
Local → Test locally → Migration file → Test on staging → Push to prod
```

---

## 🚨 URGENT: Backup Production First!

### Step 1: Backup Current Production Data

```bash
# Install Turso CLI (if not installed)
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# List your databases
turso db list

# Backup production database
turso db shell mppsc-test-series-arjun-gurjar ".dump" > prod_backup_$(date +%Y%m%d).sql

# This creates: prod_backup_20240206.sql
```

**🔥 IMPORTANT**: Keep this backup safe! Isme tumhara saara data hai.

---

## 🔧 PROPER SETUP - Step by Step

### Step 1: Create Separate Environment Files

```bash
# Create environment files
touch .env.local      # Local development
touch .env.staging    # Staging (optional)
touch .env.production # Production (for reference only)
```

### Step 2: Configure .env.local (Development)

```bash
# .env.local (Git ignored - safe)

# Local SQLite database (no Turso needed for dev)
DATABASE_URL=file:./local.db

# OR if you want to use Turso for local dev too:
# TURSO_DATABASE_URL=libsql://mppsc-local-[yourname].turso.tech
# TURSO_AUTH_TOKEN=your_local_db_token

# Other env vars
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Configure .env.production (Reference Only)

```bash
# .env.production (Git ignored - NEVER commit)

# Production Turso credentials
TURSO_DATABASE_URL=libsql://mppsc-test-series-arjun-gurjar.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your_token

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## 🔄 MIGRATION SYSTEM SETUP

### Current Drizzle Config (Update This)

```typescript
// drizzle.config.ts (UPDATED VERSION)

import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load appropriate env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.local';

dotenv.config({ path: envFile });

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: isDev ? 'sqlite' : 'turso',
  
  dbCredentials: isDev ? {
    // Local SQLite for development
    url: process.env.DATABASE_URL || 'file:./local.db'
  } : {
    // Turso for production
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
  
  // Verbose mode for debugging
  verbose: true,
  strict: true,
});
```

---

## 📋 MIGRATION WORKFLOW (The Right Way)

### Scenario: Adding New `test_leaderboard` Table

#### Step 1: Make Changes in Schema

```typescript
// src/db/schema.ts

// ADD NEW TABLE
export const testLeaderboard = sqliteTable('test_leaderboard', {
  id: text('id').primaryKey(),
  testId: text('test_id').notNull(),
  userId: text('user_id'),
  displayName: text('display_name').notNull(),
  score: real('score').notNull(),
  percentage: real('percentage'),
  timeTakenSeconds: integer('time_taken_seconds'),
  rank: integer('rank'),
  isFake: integer('is_fake', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  testIdIdx: index('leaderboard_test_idx').on(table.testId),
  rankIdx: index('leaderboard_rank_idx').on(table.testId, table.rank),
}));
```

#### Step 2: Generate Migration File (Local First!)

```bash
# Make sure you're using local database
export NODE_ENV=development

# Generate migration
npm run drizzle:generate

# OR manually:
npx drizzle-kit generate:sqlite

# This creates: drizzle/migrations/0001_new_leaderboard.sql
```

**What Happens**:
- Drizzle compares current schema with database
- Creates SQL file with changes
- File stored in `drizzle/migrations/`

#### Step 3: Review Migration File

```bash
# Check what was generated
cat drizzle/migrations/0001_new_leaderboard.sql
```

**Example Output**:
```sql
-- Migration: 0001_new_leaderboard
-- Created at: 2024-02-06 18:30:00

CREATE TABLE IF NOT EXISTS test_leaderboard (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  user_id TEXT,
  display_name TEXT NOT NULL,
  score REAL NOT NULL,
  percentage REAL,
  time_taken_seconds INTEGER,
  rank INTEGER,
  is_fake INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX leaderboard_test_idx ON test_leaderboard(test_id);
CREATE INDEX leaderboard_rank_idx ON test_leaderboard(test_id, rank);
```

**👀 REVIEW CAREFULLY**: Make sure SQL looks correct!

#### Step 4: Apply Migration to Local DB

```bash
# Apply migration to local database
npm run drizzle:migrate

# OR manually:
npx drizzle-kit push:sqlite

# This runs the SQL against local.db
```

#### Step 5: Test Locally

```bash
# Start dev server
npm run dev

# Test the new feature:
# - Create data in leaderboard
# - Query data
# - Make sure everything works
```

#### Step 6: Commit Migration Files

```bash
# Add migration files to git
git add drizzle/migrations/
git add src/db/schema.ts

# Commit
git commit -m "Add leaderboard table with indexes"
```

#### Step 7: Push to Production (Carefully!)

```bash
# BACKUP FIRST (already done in Step 1)

# Switch to production environment
export NODE_ENV=production

# Load production credentials
source .env.production

# Generate migration (should match local)
npx drizzle-kit generate:sqlite

# Review migration one more time
cat drizzle/migrations/0001_new_leaderboard.sql

# Apply to production Turso database
npx drizzle-kit push:sqlite

# OR use Turso CLI:
turso db shell mppsc-test-series-arjun-gurjar < drizzle/migrations/0001_new_leaderboard.sql
```

---

## 🔄 SYNCING PRODUCTION TO LOCAL (Important!)

### When to Sync:
- After you pushed to production
- Want to work on features locally with real schema
- Need to test with production-like data

### Method 1: Dump & Restore (Schema + Data)

```bash
# 1. Dump production database
turso db shell mppsc-test-series-arjun-gurjar ".dump" > prod_dump.sql

# 2. Restore to local SQLite
sqlite3 local.db < prod_dump.sql

# Now local.db has same schema + data as production!
```

### Method 2: Schema Only (No Data)

```bash
# 1. Get schema only
turso db shell mppsc-test-series-arjun-gurjar ".schema" > prod_schema.sql

# 2. Apply to local
sqlite3 local.db < prod_schema.sql

# Now local.db has same structure but empty tables
```

### Method 3: Use Drizzle (Cleanest)

```bash
# 1. Point drizzle to production
export NODE_ENV=production
source .env.production

# 2. Introspect production schema
npx drizzle-kit introspect:sqlite

# 3. This generates schema.ts from actual database
# Compare with your existing schema.ts

# 4. Switch back to local
export NODE_ENV=development

# 5. Generate migrations based on production schema
npx drizzle-kit generate:sqlite

# 6. Apply to local
npx drizzle-kit push:sqlite
```

---

## 📁 PROPER FOLDER STRUCTURE

```
/Users/arjun/Documents/syllabus/
├── drizzle/
│   └── migrations/                    ← Migration history
│       ├── 0000_initial_schema.sql   ← First migration
│       ├── 0001_add_leaderboard.sql  ← Second migration
│       ├── 0002_add_indexes.sql      ← Third migration
│       └── meta/                      ← Metadata
│           └── _journal.json         ← Migration log
│
├── local.db                           ← Local development database
├── local.db-journal                   ← SQLite temp file
│
├── .env.local                         ← Local environment (git ignored)
├── .env.production                    ← Prod creds (git ignored)
│
├── drizzle.config.ts                  ← Drizzle configuration
├── package.json
└── src/
    └── db/
        ├── index.ts                   ← Database client
        └── schema.ts                  ← Schema definitions
```

---

## 🎯 PACKAGE.JSON SCRIPTS (Add These)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:migrate": "drizzle-kit migrate",
    
    "db:backup": "turso db shell mppsc-test-series-arjun-gurjar '.dump' > backups/backup_$(date +%Y%m%d_%H%M%S).sql",
    "db:sync": "turso db shell mppsc-test-series-arjun-gurjar '.dump' > prod_dump.sql && sqlite3 local.db < prod_dump.sql"
  }
}
```

**Usage**:
```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push

# Open Drizzle Studio (GUI)
npm run db:studio

# Backup production
npm run db:backup

# Sync prod to local
npm run db:sync
```

---

## ⚠️ COMMON MISTAKES (Avoid These!)

### ❌ MISTAKE 1: Directly Editing Production

```bash
# DON'T DO THIS:
export NODE_ENV=production
npx drizzle-kit push:sqlite  # Direct push to prod!
```

**Why Bad**: No testing, can break production!

**✅ RIGHT WAY**:
```bash
# Test locally first
export NODE_ENV=development
npm run db:push

# Test thoroughly
npm run dev

# Then push to prod
export NODE_ENV=production
npm run db:push
```

---

### ❌ MISTAKE 2: Not Committing Migrations

```bash
# You generated migration but forgot to commit
npx drizzle-kit generate:sqlite

# Then pushed to prod
# Now your teammates don't have migration files!
```

**✅ RIGHT WAY**:
```bash
# Generate
npm run db:generate

# Commit IMMEDIATELY
git add drizzle/migrations/
git commit -m "Add new migration"
git push

# Now team has migration files
```

---

### ❌ MISTAKE 3: Ignoring Backups

```bash
# Making big changes without backup
ALTER TABLE users DROP COLUMN important_data;
```

**✅ RIGHT WAY**:
```bash
# ALWAYS backup first
npm run db:backup

# Then make changes
npm run db:push
```

---

## 🔄 MIGRATION STATES

### Understanding Migration Status:

```bash
# Check migration status
npx drizzle-kit check:sqlite

# Possible states:

✅ UP TO DATE
   - Schema matches database
   - No migrations needed

⚠️  PENDING MIGRATIONS
   - You have migration files not applied
   - Run: npm run db:push

🔴 SCHEMA DRIFT
   - Database has changes not in schema.ts
   - Someone edited DB directly
   - Solution: Sync or regenerate
```

---

## 📊 PROPER WORKFLOW DIAGRAM

```
┌────────────────────────────────────────────────────────────┐
│              DEVELOPMENT TO PRODUCTION FLOW                 │
└────────────────────────────────────────────────────────────┘

Developer's Machine (Local):
─────────────────────────────
1. Edit schema.ts
   ↓
2. Generate migration
   $ npm run db:generate
   ↓
3. Apply to local.db
   $ npm run db:push
   ↓
4. Test feature
   $ npm run dev
   ↓
5. Commit migration files
   $ git commit -m "Add feature"
   ↓
6. Push to GitHub
   $ git push origin main
   ↓

Vercel Deployment (Automatic):
───────────────────────────────
7. Vercel detects push
   ↓
8. Runs build
   $ npm run build
   ↓
9. Migrations auto-applied (if configured)
   OR
10. Manual push to production:
    $ NODE_ENV=production npm run db:push
    ↓

Production Database (Turso):
────────────────────────────
11. Migration applied
    ↓
12. New schema live!
    ↓
13. Users see new feature ✅
```

---

## 🎯 YOUR CURRENT SITUATION - What To Do NOW

### Option 1: Start Fresh with Migrations (Recommended)

```bash
# 1. Backup production (CRITICAL!)
npm run db:backup

# 2. Generate migration from current production state
export NODE_ENV=production
source .env.production
npx drizzle-kit introspect:sqlite

# This creates migration files matching current production

# 3. Commit these as "initial migration"
git add drizzle/migrations/
git commit -m "Initial migration - production snapshot"

# 4. From now on, use proper workflow
# All future changes: Local → Test → Migrate → Prod
```

---

### Option 2: Keep Production As-Is, Sync to Local

```bash
# 1. Backup production
npm run db:backup

# 2. Sync production schema to local
npm run db:sync

# 3. Update schema.ts to match production
# (Manually compare or use introspect)

# 4. Generate baseline migration
npm run db:generate

# 5. Commit
git add drizzle/migrations/ src/db/schema.ts
git commit -m "Baseline migration from production"

# 6. Future changes follow proper workflow
```

---

## 🛡️ SAFETY CHECKLIST

Before pushing ANY migration to production:

```
☐ Backup created (npm run db:backup)
☐ Migration tested locally
☐ Schema.ts matches migration
☐ Migration files committed to git
☐ Team notified (if applicable)
☐ Rollback plan ready
☐ No DROP TABLE or DROP COLUMN (unless intentional)
☐ Indexes added where needed
☐ Default values set for new columns
```

---

## 🚀 QUICK REFERENCE

### Daily Development:

```bash
# Morning: Sync from prod (if needed)
npm run db:sync

# Edit schema
# vim src/db/schema.ts

# Generate & apply migration
npm run db:generate
npm run db:push

# Test
npm run dev

# Commit
git add .
git commit -m "Add feature X"
```

### Pushing to Production:

```bash
# Backup first!
npm run db:backup

# Switch environment
export NODE_ENV=production
source .env.production

# Push migration
npm run db:push

# Verify
turso db shell mppsc-test-series-arjun-gurjar ".tables"
```

---

## 🎓 SUMMARY

### Current State:
- ✅ Production database exists (5-6 tables)
- ⚠️ No migration history yet
- ⚠️ Direct edits on production (risky)

### After Setup:
- ✅ Proper dev/prod separation
- ✅ Migration history in git
- ✅ Safe testing before production
- ✅ Rollback capability
- ✅ Team collaboration ready

### Key Principles:
1. **NEVER edit production directly**
2. **ALWAYS test locally first**
3. **ALWAYS backup before big changes**
4. **ALWAYS commit migration files**
5. **Use migrations for ALL schema changes**

---

**Bhai, ab se tumhara database workflow professional level ka ho jayega! 🚀**


---

## 🔧 PRACTICAL COMMANDS - Copy-Paste Ready

### Setup Commands (One-Time)

```bash
# 1. Backup production RIGHT NOW
mkdir -p backups
turso db shell mppsc-test-series-arjun-gurjar ".dump" > backups/prod_backup_$(date +%Y%m%d).sql

# 2. Download production data to local
turso db shell mppsc-test-series-arjun-gurjar ".dump" > prod_current.sql
sqlite3 local.db < prod_current.sql

# 3. Verify local database
sqlite3 local.db ".tables"
# Should show: mppsc_users, tests, questions, user_attempts, etc.

# 4. Create proper .env.local
cat > .env.local << 'ENV'
# Local Development
DATABASE_URL=file:./local.db
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV

# 5. Update drizzle.config.ts (already shown above)

# 6. Generate initial migration from current state
npx drizzle-kit generate:sqlite

# 7. Commit baseline
git add drizzle/migrations/ .env.local
git commit -m "Setup proper migration system - baseline from production"
```

---

### Daily Workflow Commands

#### Morning: Start Work

```bash
# 1. Pull latest code
git pull origin main

# 2. Check if migrations pending
npx drizzle-kit check:sqlite

# 3. Apply any new migrations from team
npx drizzle-kit push:sqlite

# 4. Start dev server
npm run dev
```

#### Adding New Feature (e.g., Leaderboard Table)

```bash
# 1. Edit schema
# Add testLeaderboard table in src/db/schema.ts

# 2. Generate migration
npx drizzle-kit generate:sqlite
# This creates: drizzle/migrations/0001_add_leaderboard.sql

# 3. Review the migration
cat drizzle/migrations/0001_*.sql

# 4. Apply to local database
npx drizzle-kit push:sqlite

# 5. Test locally
npm run dev
# Test leaderboard feature thoroughly

# 6. If something wrong, rollback
# Delete the migration file
rm drizzle/migrations/0001_*.sql
# Restore local.db from backup
cp local.db.backup local.db

# 7. If all good, commit
git add drizzle/migrations/ src/db/schema.ts
git commit -m "feat: Add leaderboard table with ranking system"
git push origin main
```

#### Pushing to Production

```bash
# 1. CRITICAL: Backup production first
turso db shell mppsc-test-series-arjun-gurjar ".dump" > backups/pre_leaderboard_$(date +%Y%m%d_%H%M%S).sql

# 2. Review what will be applied
cat drizzle/migrations/0001_*.sql

# 3. Apply to production
# Method A: Using drizzle-kit
export TURSO_DATABASE_URL="libsql://mppsc-test-series-arjun-gurjar.aws-ap-south-1.turso.io"
export TURSO_AUTH_TOKEN="your_token_here"
npx drizzle-kit push:sqlite --config=drizzle.config.ts

# Method B: Using Turso CLI (safer, more control)
turso db shell mppsc-test-series-arjun-gurjar < drizzle/migrations/0001_*.sql

# 4. Verify migration applied
turso db shell mppsc-test-series-arjun-gurjar ".tables"
# Should now show: test_leaderboard

# 5. Check table structure
turso db shell mppsc-test-series-arjun-gurjar ".schema test_leaderboard"

# 6. Deploy to Vercel (if not auto-deployed)
vercel --prod
```

---

### Emergency: Rollback Migration

```bash
# If migration caused issues in production

# 1. Restore from backup
turso db shell mppsc-test-series-arjun-gurjar < backups/pre_leaderboard_20240206_180000.sql

# 2. Remove problematic migration locally
git revert HEAD  # Revert last commit
# OR
rm drizzle/migrations/0001_bad_migration.sql
git commit -am "Rollback bad migration"

# 3. Fix the issue
# Edit schema.ts
# Generate new migration
# Test thoroughly
# Try again
```

---

### Syncing Production → Local (Weekly/As Needed)

```bash
# Full sync (schema + data)
turso db shell mppsc-test-series-arjun-gurjar ".dump" > prod_sync.sql
sqlite3 local.db < prod_sync.sql

# Schema only (no data)
turso db shell mppsc-test-series-arjun-gurjar ".schema" > prod_schema.sql
sqlite3 local.db < prod_schema.sql

# Verify sync
sqlite3 local.db ".tables"
sqlite3 local.db "SELECT COUNT(*) FROM mppsc_users;"
```

---

### Checking Database Status

```bash
# Local database
sqlite3 local.db ".tables"
sqlite3 local.db ".schema mppsc_users"
sqlite3 local.db "SELECT COUNT(*) FROM mppsc_users;"

# Production database
turso db shell mppsc-test-series-arjun-gurjar ".tables"
turso db shell mppsc-test-series-arjun-gurjar "SELECT COUNT(*) FROM mppsc_users;"

# Migration status
npx drizzle-kit check:sqlite

# View migration history
cat drizzle/migrations/meta/_journal.json
```

---

### Useful Turso Commands

```bash
# List all databases
turso db list

# Create new database (for staging)
turso db create mppsc-staging

# Delete database (CAREFUL!)
turso db destroy database-name

# Show database info
turso db show mppsc-test-series-arjun-gurjar

# Get connection URL
turso db show mppsc-test-series-arjun-gurjar --url

# Create new auth token
turso db tokens create mppsc-test-series-arjun-gurjar

# Open interactive shell
turso db shell mppsc-test-series-arjun-gurjar

# Execute single query
turso db shell mppsc-test-series-arjun-gurjar "SELECT * FROM mppsc_users LIMIT 5;"
```

---

### Drizzle Studio (Visual Database Editor)

```bash
# Open Drizzle Studio (GUI for database)
npx drizzle-kit studio

# Opens browser at: https://local.drizzle.studio
# You can:
# - View all tables
# - Edit data
# - Run queries
# - See relationships
```

---

## 🆘 TROUBLESHOOTING

### Problem 1: Migration Already Applied

```bash
Error: Migration already applied to database

Solution:
# Delete migration from meta
# Edit: drizzle/migrations/meta/_journal.json
# Remove the entry for problematic migration
# OR
# Just generate with new name
npx drizzle-kit generate:sqlite
```

### Problem 2: Schema Drift Detected

```bash
Error: Database schema doesn't match schema.ts

Solution:
# Option A: Make database match schema
npx drizzle-kit push:sqlite --force

# Option B: Make schema match database
npx drizzle-kit introspect:sqlite
# This regenerates schema.ts from database
```

### Problem 3: Can't Connect to Turso

```bash
Error: Unable to connect to database

Solution:
# Check credentials
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN

# Regenerate token
turso db tokens create mppsc-test-series-arjun-gurjar

# Update .env files with new token
```

### Problem 4: Local DB Corrupted

```bash
Error: database disk image is malformed

Solution:
# Delete and restore from production
rm local.db
npm run db:sync

# OR restore from backup
cp local.db.backup local.db
```

---

## 📝 CHEAT SHEET (Print This!)

```
┌─────────────────────────────────────────────────────────┐
│            MIGRATION CHEAT SHEET                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Development Flow:                                       │
│  ─────────────────                                       │
│  1. Edit schema.ts                                       │
│  2. npm run db:generate                                  │
│  3. npm run db:push                                      │
│  4. Test locally                                         │
│  5. git commit & push                                    │
│                                                          │
│  Production Push:                                        │
│  ────────────────                                        │
│  1. npm run db:backup                                    │
│  2. Review migration SQL                                 │
│  3. NODE_ENV=production npm run db:push                  │
│  4. Verify with turso db shell                          │
│                                                          │
│  Emergency Rollback:                                     │
│  ───────────────────                                     │
│  1. Stop application                                     │
│  2. Restore from backup                                  │
│  3. Revert git commit                                    │
│  4. Restart application                                  │
│                                                          │
│  Common Commands:                                        │
│  ────────────────                                        │
│  npx drizzle-kit generate:sqlite   → Create migration   │
│  npx drizzle-kit push:sqlite       → Apply migration    │
│  npx drizzle-kit studio            → Open GUI           │
│  npm run db:backup                 → Backup prod DB     │
│  npm run db:sync                   → Sync prod → local  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 FINAL RECOMMENDATIONS

### For Your Current Situation:

**TODAY (This Week)**:
```bash
# 1. Take backup
npm run db:backup

# 2. Sync to local
npm run db:sync

# 3. Generate baseline migration
npx drizzle-kit generate:sqlite

# 4. Commit
git commit -m "Baseline migration"

# 5. Start using proper workflow
```

**FROM NOW ON**:
- ✅ All changes in local.db first
- ✅ Test thoroughly before production
- ✅ Always backup before prod push
- ✅ Commit migrations to git
- ✅ Document breaking changes

**NEVER**:
- ❌ Direct edits on production
- ❌ Push without testing
- ❌ Skip backups
- ❌ Forget to commit migrations

---

**Bhai, ab tumhara migration system industry-standard level ka hai! Safe, professional, aur scalable!** 🚀

