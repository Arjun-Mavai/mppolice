# 🎯 MP Police - Database S.G.M.C. Standard & SOP

Welcome to the Database Standard Operating Procedure (SOP) for the **MP Police** project.
To ensure we maintain a Zero-Risk, drift-free, and perfectly synced database architecture, we strictly follow the **S.G.M.C. Workflow**.

---

## 🚀 The S.G.M.C. Workflow (Never skip a step)

Whenever you need to add a new column, modify a table, or change the schema, ALWAYS follow this 4-step workflow locally before pushing to production:

### 1. **S**chema (`src/db/schema.ts`)
Edit the Drizzle schema file (`src/db/schema.ts`). Add your new tables, columns, or relations here. This file is the **single source of truth**.

### 2. **G**enerate (`npm run db:generate`)
Once the schema is updated, run:
```bash
npm run db:generate
```
*What this does:* Drizzle will compare your `schema.ts` with the current migration history in the `drizzle/` folder and generate a new `.sql` file (e.g., `0021_...sql`). It does NOT touch the database yet.

### 3. **M**igrate (`npm run db:migrate`)
Apply the generated SQL to your **local database** first to ensure it works without errors:
```bash
NODE_ENV=development USE_PROD_DB=false npm run db:migrate
```
*If this works perfectly, you can run it for Production Turso DB:*
```bash
NODE_ENV=production npm run db:migrate
```

### 4. **C**ommit (`git commit`)
Add the newly generated SQL file in the `drizzle/` folder and the updated `schema.ts` to your Git commit.
```bash
git add drizzle/ src/db/schema.ts
git commit -m "db: added new column to users table"
```

---

## 🔍 How to Check Database Sync & Drift

If you ever feel that your Turso Production DB and Local Codebase are out of sync, run these checks:

### Check 1: Are there un-generated schema changes?
Run:
```bash
npm run db:generate
```
**Expected Output:** `No schema changes, nothing to migrate 😴`
*(If it generates a new file, it means your `schema.ts` was modified but `db:generate` was never run).*

### Check 2: Are there un-applied migrations?
Run:
```bash
npx tsx temp-migration-check.ts # (Custom script if needed)
```
Or simply run `npm run db:migrate` locally. If it says `migrations applied successfully`, you had pending migrations.

---

## 📊 Database Health & Commands

You can use the `turso` CLI to quickly inspect your production database.

**1. Check Database Size & Storage:**
```bash
turso db show mp-police
```
*(Shows total size in MB, locations, and connection URL)*

**2. List All Tables in Turso:**
```bash
turso db shell mp-police ".tables"
```

**3. Run a Quick Query (e.g., count users):**
```bash
turso db shell mp-police "SELECT COUNT(*) FROM mppsc_users;"
```

**4. Generate a New Auth Token:**
```bash
turso db tokens create mp-police
```

---

## 🔄 Local Database Backup (The 'mppolice db' Alias)

To instantly download the production database and overwrite your local `mppolice_local_dev.db` so you can test safely with real data:

Simply type:
```bash
mppolice db
```
*(Requires the alias to be set in your `~/.zshrc`: `alias "mppolice db"="/Users/arjun/mppolice/db-backup.sh"`)*

This script automatically creates a safety backup of your local DB in the `backups/` folder before overwriting it with the fresh Turso backup.
