# 🌿 Zenscroll (formerly Mindful)

**Turn Doomscrolling into Mindful Scrolling.**

Zenscroll is a premium digital sanctuary designed to replace the cheap dopamine of social media with the serotonin of wisdom. Instead of endless feeds of noise, swipe through curated insights from history's greatest minds in Spirituality, Business, Philosophy, and Science.

![Zenscroll Demo](https://images.unsplash.com/photo-1519098901909-b1553a1190af?q=80&w=2574&auto=format&fit=crop)
_(Note: Replace with actual screenshot)_

## ✨ Features

- **🧠 Mindful Swiping**: Tinder-style interface designed for focus, not addiction. Swipe right to save wisdom, left to let go.
- **🎨 Zen Mode**: Toggle between a vibrant daylight mode and a deep, ambient "Zen Mode" for night-time reflection.
- **🔒 Premium Categories**: Exclusive access to "Ted Wisdom" and "Scientific Proven" facts (Paywall integrated).
- **👤 Smart Profiling**: Tracks your daily swipes and saved collection.
- **⚡ Performance First**: Built with Next.js Server Components for lightning-fast data fetching.
- **🔍 Deep Filtering**: Filter wisdom not just by Category (e.g., Stoicism), but also by specific Authors (e.g., Marcus Aurelius).

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **Animation**: Framer Motion (Spring Physics, AnimatePresence)
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase Account

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Arjun-Mavai/zenscroll.git
    cd zenscroll
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Only for seeding
    ```

4.  **Seed the Database**
    Populate your database with the initial curated quotes:

    ```bash
    npx tsx src/scripts/seed.ts
    ```

5.  **Run the App**
    ```bash
    npm run dev
    ```

## 🤝 Contribution

This is an open initiative to make the internet a calmer place. Feel free to open PRs for new features or bug fixes.

## 📄 License

MIT.

---

_Crafted with ❤️ by Arjun Mavai._

Bilkul bhai 😄
Maine **tumhara poora Turso + Local Sync + Drizzle + Migration + Workflow** content ko ekdum **clean professional Markdown (.md)** format me convert kar diya hai.

👉 **Direct copy → README.md / docs.md / Notion / GitHub use kar sakta hai**

---

# 🚀 Turso + Local SQLite + Drizzle Migrations

## Complete Dev Workflow Guide (Zero → Pro Level)

---

# 🧠 Big Picture (Feel First)

Socho:

### 🎨 Original Painting = Cloud DB (Production)

### 🖨️ Photocopy = Local DB

👉 Tum **photocopy pe experiment karte ho**
👉 Original safe rehta hai

Yahi hai:

```
Branching / Sync / Local Dev
```

---

---

# 📦 PART 1 — Turso Local Setup

---

## ✅ Step 1 — SQLite Installed hai ya nahi?

```bash
sqlite3 --version
```

Agar error:

### Mac

```bash
brew install sqlite
```

---

---

## ✅ Step 2 — Cloud se Data Dump lo

👉 Production DB ka **recipe (SQL file)** nikalo

```bash
turso db shell <db-name> .dump > data_backup.sql
```

### Result:

```
data_backup.sql
```

Isme:

- tables
- schema
- data
  sab likha hota hai

---

---

## ✅ Step 3 — Local SQLite file banao

```bash
sqlite3 my_local_db.db < data_backup.sql
```

### Result:

```
my_local_db.db
```

👉 Full local copy ready

---

---

## ✅ Step 4 — Turso ko Local Mode me chalao

```bash
turso dev --db-file my_local_db.db
```

### Output:

```
Listening on http://127.0.0.1:8080
```

⚠️ Terminal band mat karo

---

---

## ✅ Step 5 — TablePlus / Beekeeper Connect

| Setting  | Value                                          |
| -------- | ---------------------------------------------- |
| Driver   | libSQL                                         |
| Host     | [http://127.0.0.1:8080](http://127.0.0.1:8080) |
| User     | (blank)                                        |
| Password | (blank)                                        |

---

---

# 🧠 Quick Summary

| What       | File            |
| ---------- | --------------- |
| Cloud dump | data_backup.sql |
| Local DB   | my_local_db.db  |
| Run server | turso dev       |

---

---

# 🚀 PART 2 — Drizzle Migrations (Most Important 🔥)

---

# 🧠 Feel the Concept First

## Structure vs Data

### Structure (Schema)

- tables
- columns
- relations

### Data

- users
- posts
- records

---

### Migration = Structure Sync only

👉 Data ko touch nahi karta
👉 Sirf design change karta hai

---

---

# 🔥 Drizzle Commands Deep Meaning

---

## 🟢 `generate` (Architect)

```bash
npx drizzle-kit generate
```

### Kya karta hai?

👉 schema.ts compare karta hai
👉 difference detect karta hai
👉 SQL file banata hai

Example:

```
ALTER TABLE users ADD COLUMN age INTEGER;
```

### Output:

```
drizzle/
  0001_add_age.sql
```

---

---

## 🔵 `migrate` (Worker)

```bash
npx drizzle-kit migrate
```

### Kya karta hai?

👉 sab pending SQL files run karta hai
👉 DB update karta hai

---

### Internal Magic

Drizzle ek table banata hai:

```
drizzle_migrations
```

Isme track hota hai:

```
0001 ✓ done
0002 ✓ done
0003 pending
```

👉 duplicate run nahi hota

---

---

# 🔥 Real Cases (Feel karo)

---

## Add Column

```ts
age: integer();
```

Migration:

```sql
ALTER TABLE users ADD COLUMN age;
```

Result:

```
data safe
new column NULL
```

---

---

## Delete Column ⚠️

```sql
ALTER TABLE users DROP COLUMN age;
```

Result:

```
age ka sara data gaya permanently
```

---

---

## Add Table

```sql
CREATE TABLE orders;
```

Safe ✅

---

---

## Drop Table ⚠️

```sql
DROP TABLE users;
```

Sab data gaya ❌

---

---

# 🚀 PART 3 — Vercel Deployment Flow

---

## Normal Dev Flow

### Step 1

Edit schema.ts

### Step 2

```bash
npx drizzle-kit generate
```

### Step 3

```bash
git push
```

---

---

# Production me migration kaise chalegi?

## Best Practice

### package.json

```json
{
  "build": "drizzle-kit migrate && next build"
}
```

---

## Vercel Flow

```
Deploy start
   ↓
drizzle-kit migrate
   ↓
DB updated
   ↓
Next build
   ↓
Site live
```

---

👉 Sirf pending migrations run hoti hain
👉 order me run hoti hain

---

---

# 🧠 Super Important Rule

```
generate → create instruction
migrate → execute instruction
```

---

---

# 🚀 PART 4 — Turso Sync Scripts (Automation)

---

## 🔥 db-sync (Cloud → Local)

```bash
db-sync() {
SOURCE_DB="mppsc-test-series"

TS=$(date +%m%d%H%M)
BACKUP_NAME="bkp-mppsc-${TS}"

echo "☁️ Backup creating..."
turso db create "$BACKUP_NAME" --from-db "$SOURCE_DB"

echo "📥 Dumping..."
turso db shell "$SOURCE_DB" .dump > temp_dump.sql

echo "💻 Refreshing local..."
rm -f local_test.db
sqlite3 local_test.db < temp_dump.sql
rm temp_dump.sql

echo "✅ Done!"
}
```

---

---

## 🔥 db-sync-all (Pro version)

```bash
db-sync-all() {
SOURCE_DB="mppsc-test-series-arjun-gurjar"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "☁️ Creating backup..."
turso db create "backup-${SOURCE_DB}-${TIMESTAMP}" --from-db $SOURCE_DB

echo "📥 Dumping..."
turso db shell $SOURCE_DB .dump > temp_dump.sql

echo "💻 Refreshing local..."
rm -f local_test.db
sqlite3 local_test.db < temp_dump.sql
rm temp_dump.sql

echo "✅ Local ready!"
}
```

---

---

# 🔥 Cloud overwrite (Use carefully)

```bash
db-push-to-cloud() {
SOURCE_DB="mppsc-test-series-arjun-gurjar"

echo "⚠️ Overwriting cloud..."
turso db shell $SOURCE_DB < local_test.db

echo "🚀 Done!"
}
```

---

---

# 🚀 PART 5 — Drizzle Config

```ts
import { defineConfig } from 'drizzle-kit';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: isDev ? 'sqlite' : 'turso',
  dbCredentials: {
    url: isDev ? 'file:local_test.db' : process.env.TURSO_DATABASE_URL,
    authToken: isDev ? undefined : process.env.TURSO_AUTH_TOKEN,
  },
});
```

---

---

# 🔥 Final Dev Workflow (Golden Process)

## Daily Routine

### Start

```bash
db-sync-all
npm run dev
```

## to handle the nextjs cache issues locally

# Full cleanup

- rm -rf .next node_modules/.cache
  rm -rf .next node_modules/.cache .turbo

why .turbo ?

Bhai, ye same Turbopack cache corruption issue hai! Tumne bahut saare files edit kiye hain (10+ files), toh cache completely corrupt ho gaya hai.

Quick Fix:

bash
rm -rf .next node_modules/.cache
npm run dev
Ye error code me koi problem nahi hai — sirf Next.js ka internal Turbopack database corrupt ho gaya hai.

Kya hua:

Tumne bahut saare files ek saath edit kiye (navbar, analytics, error pages, etc.)
Turbopack ka cache database (.next folder) confused ho gaya
SST files (sorted string table) missing ho gayi
Solution:

Dev server stop karo (Ctrl+C)
.next folder delete karo
Dev server restart karo
Tumhare saare changes safe hain! Sirf cache issue hai. 🚀

Agar phir bhi problem ho toh full cleanup:

bash
rm -rf .next node_modules/.cache .turbo
npm run dev

- npm run dev

### Work

- change schema
- generate
- migrate

### Deploy

```bash
git push
```

Vercel:

```
auto migrate → build → live
```

---

---

# 🎯 Final Feel (Remember this forever)

```
Schema change = Migration
Data change = Manual

generate = instruction file
migrate = run instruction

Local = playground
Cloud = original painting
```

---

---

# ✅ Done

Bhai ab:

- Turso branching
- dump restore
- drizzle migrations
- vercel flow
- full sync system

sab crystal clear ho gaya hona chahiye 😄

Agar bole toh next:
👉 Docker setup
👉 seed scripts
👉 prod/staging/local pipeline diagram
👉 ya live demo style walkthrough

bol de 🔥

// mysql postgresql branching ka kya matlab hai

https://share.google/aimode/IhUIU2VLPWBrRVC61

Bilkul bhai 👍
Maine tumhara pura content **clean + structured + professional Markdown (.md)** format me convert kar diya hai.
Direct GitHub README / docs / Notion / Obsidian / VSCode me paste kar sakte ho.

---

# 🚀 Database Branching & Debugging Guide

### (Turso vs MySQL vs Postgres — Practical Dev Workflow)

---

## 🧠 Big Picture

**Turso (SQLite)** me branching **built-in** hoti hai (Copy-on-Write).
**MySQL / Postgres** me branching **manual copy (Dump & Restore)** se karni padti hai.

👉 Matlab:

| DB             | Branching      |
| -------------- | -------------- |
| Turso          | ⚡ Instant     |
| MySQL/Postgres | 🐢 Manual copy |

---

# 🟢 1️⃣ Turso (SQLite) – Instant Branching

## How it works?

- Copy-on-Write technology
- Sirf changed pages copy hoti hain
- Full DB copy nahi hoti

## Result

```
1 second me branch ready
```

## Command

```bash
turso db create debug-branch --from prod
```

## Benefits

✅ Super fast
✅ Zero config
✅ No server
✅ Perfect for Next.js apps

---

# 🔵 2️⃣ MySQL / Postgres – Manual "Branching"

Yaha **true branching nahi hoti**,
hum **Database Copy** banate hain.

---

## 🟡 Postgres Method (Professional way)

Postgres me **TEMPLATE** aur **Dump/Restore** hota hai.

### Option A – Template clone (same server)

```sql
CREATE DATABASE debug_db TEMPLATE prod_db;
```

⚡ Very fast (same machine only)

---

### Option B – Dump & Restore (standard)

```bash
pg_dump → backup
pg_restore → copy
```

---

## 🔴 MySQL Method

MySQL me **direct clone feature nahi** hota.

Steps:

1. Dump lo
2. New DB banao
3. Restore karo

---

---

# 🧪 3️⃣ Live Debugging Workflow (Real Use-Case)

### Scenario:

👉 Production me bug aaya

### Steps:

```
1. Production DB ka snapshot lo
2. Local DB create karo
3. Snapshot restore karo
4. .env change karo
5. Debug safely
```

### Benefit

✅ Live site disturb nahi hoti
✅ Exact same data milta hai
✅ Safe testing

---

---

# 🛠️ 4️⃣ MySQL Sync Script (Alias)

```bash
# MySQL Sync Alias
mysql-sync() {
    USER="root"
    PASS="password"
    LIVE_DB="mppsc_prod"
    LOCAL_DB="mppsc_local"

    echo "📥 Dumping production..."

    mysqldump -u $USER -p$PASS $LIVE_DB > temp_prod.sql

    echo "💻 Refreshing local DB..."

    mysql -u $USER -p$PASS -e "DROP DATABASE IF EXISTS $LOCAL_DB; CREATE DATABASE $LOCAL_DB;"
    mysql -u $USER -p$PASS $LOCAL_DB < temp_prod.sql

    rm temp_prod.sql
    echo "✅ MySQL Local Sync Done!"
}
```

---

---

# 🛠️ 5️⃣ Postgres Sync Script (Fast & Pro)

```bash
# Postgres Sync Alias
pg-sync() {
    LIVE_URL="postgres://user:pass@host:port/dbname"
    LOCAL_DB="mppsc_local"

    echo "📥 Dumping production..."

    pg_dump -d $LIVE_URL -Fc -f prod_backup.dump

    echo "💻 Refreshing local DB..."

    dropdb --if-exists $LOCAL_DB
    createdb $LOCAL_DB
    pg_restore -d $LOCAL_DB prod_backup.dump

    rm prod_backup.dump
    echo "✅ Postgres Local Sync Done!"
}
```

---

---

# ⚖️ 6️⃣ Deep Comparison

| Feature    | Turso (SQLite) | MySQL/Postgres |
| ---------- | -------------- | -------------- |
| Speed      | ⚡ Instant     | 🐢 Slow        |
| Branching  | Built-in       | Manual         |
| Setup      | Zero           | Server install |
| Complexity | Very Low       | Medium/High    |
| Cost       | Storage based  | Server CPU/RAM |
| Dev UX     | Super smooth   | Heavy          |

---

---

# 🎯 Final Summary

## ✅ Turso use karo if:

- Small/medium apps
- Next.js projects
- Fast dev cycle chahiye
- Zero infra

## ✅ Postgres/MySQL use karo if:

- Huge traffic
- Complex joins
- Enterprise scale
- Heavy analytics

---

---

# 💡 Bhai ki Advice

👉 Agar lakhon users nahi hain
👉 Next.js app hai
👉 Fast debugging chahiye

### 👉 Turso = ❤️

---

---

# 🐳 Bonus Tip (Important)

MySQL/Postgres local manage karna ho?

### Use Docker 👇

```bash
docker-compose up -d
```

Benefits:
✅ No local install mess
✅ Clean setup
✅ Same environment everywhere

---

---

# 🔥 Quick Commands Cheat Sheet

## Turso

```bash
turso db create debug --from prod
```

## MySQL

```bash
mysql-sync
```

## Postgres

```bash
pg-sync
```

---

---

# ✅ Done

Ye markdown:

- README ready
- Docs ready
- GitHub ready
- Team sharing ready

---

Agar chaho bhai:
👉 main iska **Docker Compose file** bhi bana du
👉 ya **Turso vs Postgres decision flowchart**
👉 ya **prod → staging → local pipeline**

bol de, bana dete hain 🔥
