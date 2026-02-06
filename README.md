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

turso db create locally

arjun@Arjuns-MacBook-Air ~ % turso db create mppsc-syllabus-dev
Created database mppsc-syllabus-dev at group default in 1.506s.

turso auth login

turso db create mppsc-syllabus-dev
turso db show mppsc-syllabus-dev --url

Start an interactive SQL shell with:

turso db shell mppsc-syllabus-dev

To see information about the database, including a connection URL, run:

turso db show mppsc-syllabus-dev

To get an authentication token for the database, run:

turso db tokens create mppsc-syllabus-dev

turso db show mppsc-syllabus-dev

local sqlite connecttion setup

Bhai, fikar mat kar, main bilkul zero se step-by-step samjhata hoon. Maan lo tumne pehli baar Turso use kiya hai.
Hum basically Cloud (Internet) se data ki ek copy nikaal kar apne computer (Local) ke andar ek file mein daal rahe hain, taaki tum bina internet ke development kar sako.
Niche diye gaye 5 Steps follow karo:
Step 1: Software Check (Zaroori Hai)
Sabse pehle check karo ki tumhare paas SQLite hai ya nahi.
Terminal (Command Prompt) kholo aur likho: sqlite3 --version
Agar Error aaye: Toh sqlite.org se download karlo ya Mac par brew install sqlite karlo. Iske bina local file nahi banegi.
Step 2: Cloud se Data ki "Recipe" (Dump) nikaalna
Tumhara database Turso ki website (Cloud) par hai. Hum wahan se saara data ek text file mein nikalenge.
Terminal mein ye likho:
bash
turso db shell <aapka-db-name> .dump > data_backup.sql
Use code with caution.

Kya hua?: Ek file ban gayi data_backup.sql. Isme tumhare tables banane ki saari coding likhi hai.
Step 3: Local Database File Banana
Ab us "Recipe" (SQL file) ko ek asli database file mein badalna hai jo tumhare computer par rahegi.
Terminal mein ye likho:
bash
sqlite3 my_local_db.db < data_backup.sql
Use code with caution.

Kya hua?: Ab tumhare folder mein my_local_db.db naam ki ek asli database file aa gayi hai. Isme tumhara saara data hai.
Step 4: Turso ko Local Mode mein chalana
Turso CLI ko bolo ki ab internet waale database ko bhul jaye aur is local file ko use kare.
Terminal mein ye likho:
bash
turso dev --db-file my_local_db.db
Use code with caution.

Result: Terminal mein likha aayega Listening on http://127.0.0.1:8080.
Dhyan dein: Is terminal window ko band mat karna, warna local database band ho jayega.
Step 5: TablePlus / Beekeeper mein dekhna
Ab TablePlus kholo aur ye settings dalo:
Driver: libSQL
Host/URL: http://127.0.0.1:8080 (Wahi jo terminal mein dikh raha hai)
User/Password: Dono ko KHAALI (Blank) chhod do.
Connect par click karo.
Summary (Kya, Kahan, Kaise)
Cloud se kya laaye?: data_backup.sql (Text file)
Kahan rakha?: Apne computer ke ek folder mein.
Kaise dekha?: turso dev command chala kar TablePlus se connect kiya.

migrations learning

Bhai, ye bahut solid sawaal hai. Jab hum local mein kaam karte hain aur production mein database alag hota hai, toh hum Data sync nahi karte, balki Structure (Schema) sync karte hain.
Ise "Migrations" kehte hain. Simple bhasha mein samjho:

1. Concept: Data vs Structure
   Data (Prod): Tumhare asli users ka data (Isse kabhi mat chhedna).
   Structure (Local): Tumne naya column banaya ya nayi table banayi.
   Target: Hume sirf naya column/table production mein bhejna hai, bina purana data delete kiye.
2. Drizzle Use Karne Ka Sahi Tarika (Step-by-Step)
   Aap Drizzle use kar rahe ho, toh ye process sabse best hai:
   Step A: Local Change Karein
   Aapne apni schema.ts file mein koi naya badlav kiya (jaise ek naya age column add kiya).
   Step B: Migration File Banayein (Drizzle Kit)
   Terminal mein command chalayein:
   bash
   npx drizzle-kit generate
   Use code with caution.

Kya hoga?: Ek migrations naam ka folder ban jayega jisme ek .sql file hogi. Is file mein likha hoga: ALTER TABLE users ADD COLUMN age....
Step C: Local DB Update Karein
bash
npx drizzle-kit migrate
Use code with caution.

Kya hoga?: Aapka local my_local_db.db update ho jayega. Ab aap code test kar sakte ho.
Step D: Production (Turso Cloud) Update Karein
Jab aapka code ready ho jaye aur aap use GitHub/Vercel par push kar dein, toh production DB ko update karne ke liye:
Apni .env mein wapas Production URL aur Token daalein.
Wahi command phir se chalayein:
bash
npx drizzle-kit migrate
Use code with caution.

Result: Drizzle itna smart hai ki wo dekhega Production mein kya kami hai aur sirf wahi changes wahan apply karega. Aapka purana data bilkul safe rahega. 3. Summary Process (Workflow)
Local Schema Update karo.
generate command se Migration file banao.
Local DB par Migrate karke test karo.
Prod DB par Migrate karke changes live karo.
Ek Zaruri Baat:
Agar aapka naya data (Jo aapne local mein bhara hai) production mein le jana hai, toh wo manual karna padta hai (Import/Export). Lekin development mein hum sirf Tables ka design sync karte hain, data nahi.
Kya aapne apne project mein drizzle-kit setup kiya hua hai? Agar nahi, toh main uski config file banwa deta hoon.

bhai samaj nahi aa ya feel karwao properly sync ka system command generate migrate kya kar rahi h drizzle-kit ki and kaise kya kya karna h like add column ,delete , add , delete ke case me bhai ache se batao ki maja aa jaayae bhai proper feel aaye ki iska general concept samaj aa jaye ki yahi hota h har jagah databased me and migratino file kaie run hogi jab deploy karenge vercel par deploy h nextjs app wo proper flow batao bhai kya sab migrations file run hoti h order me proper feel batao bhai
Bhai, ekdum sahi sawal hai! Ye jo "Feel" tum maang rahe ho, ye samajh gaye toh tum database ke king ban jaoge. Chalo, ek kahani se shuru karte hain.

1. Feel the Problem: Kahani Structure vs Data ki
   Maan lo tumne ek ghar banaya (Database).
   Structure: Deewarein kahan hain, kamre kitne hain (Tables and Columns).
   Data: Ghar ke andar rakha saaman aur rehne wale log (Users, Posts).
   Ab tumne local mein apne "Design" (Schema) mein ek naya kamra (Column) add kiya. Tum ye naya kamra Production wale ghar mein bhi banana chahte ho, lekin bina wahan ke logo ko bahar nikale ya purana saaman kharab kiye.
   Yahin kaam aati hai Migration File.
2. Drizzle-Kit Commands ki "Asliyat"
   Jab tum npx drizzle-kit generate aur migrate chalate ho, toh piche ye ho raha hota hai:
   A. npx drizzle-kit generate (The Architect)
   Ye command tumhari schema.ts file aur tumhare migrations folder ko compare karti hai.
   Kya hota hai?: Ye ek nayi .sql file banati hai jisme instructions hote hain.
   Example: Agar tumne age column add kiya, toh ye file kahegi: "Bhai, Table 'Users' mein ek 'Integer' column 'age' add kar do."
   Order ka Magic: Ye files 0001_abc.sql, 0002_xyz.sql aise numbering mein banti hain. Taki database ko pata chale pehle kya karna hai aur baad mein kya.
   B. npx drizzle-kit migrate (The Labor/Worker)
   Ye command wo instructions (SQL files) uthati hai aur tumhare Database (Turso) par jaakar chala deti hai.
   Ye database mein ek choti si table banati hai (drizzle_migrations) ye yaad rakhne ke liye ki "Maine file 0001 aur 0002 toh chala di hai, ab agali baar sirf 0003 chalani hai."
3. Case-by-Case: Kya hoga?
   Add Column: Migration file banegi: ALTER TABLE ... ADD COLUMN .... Data safe rahega, naye column mein sabki value NULL ya default ho jayegi.
   Delete Column: Migration file banegi: ALTER TABLE ... DROP COLUMN .... Warning! Wo column ka saara data hamesha ke liye ud jayega.
   Delete Table: Puri table saaf.
4. Vercel aur Deployment ka "Full Flow" (The Pro Way)
   Jab tum Next.js app Vercel par deploy karte ho, toh database sync karne ka best tarika ye hai:
   Local Development:
   schema.ts badlo.
   npx drizzle-kit generate chalao (Migration file folder mein aa gayi).
   git add . aur git push karo GitHub par.
   Deployment (Vercel):
   Vercel tumhara code build karega.
   Lekin Database kaise update hoga?
   Best Practice: Vercel ke package.json mein build script ko aise likho:
   "build": "drizzle-kit migrate && next build"
   Jaise hi Vercel build shuru karega, wo pehle Turso (Production) ko update karega, fir app live karega.
5. General Concept (Universal Truth)
   Duniya ka koi bhi database tool ho (Prisma, Drizzle, TypeORM), sab isi "Recipe" par chalte hain:
   State A (Purana Design)
   Change (Naya Code)
   Migration (Dono ka difference nikaal kar instructions banana)
   Execution (Instructions ko database par apply karna)
   Ek Summary Feel:
   Migration file ek "Time Machine" ki tarah hai. Agar tum naya database aaj banate ho, toh ye saari migration files (0001 to 0099) ek-ek karke run hongi aur tumhara database bilkul waisa ban jayega jaisa aaj tumhara code hai.
   Bhai, kya ab ye "Instruction vs Execution" wala concept dimaag mein baitha? Agar haan, toh batao main tumhara drizzle.config.ts check karwaun?
   Drizzle Kit Documentation par jaakar tum iske aur commands bhi dekh sakte ho.
   Next step kya hona chahiye bhai? Migrations run karke dikhaun ya config set karein?
   migration learning
   https://share.google/aimode/xqxvEsStVJUiDEmo8

Bhai, aapka plan solid hai. Agar aap akele kaam kar rahe ho aur safe rehna chahte ho, toh "Schema Push" aur "Data Seeding" ka combo use karo.
Aapke approach mein data gayab hone ke chances tabhi hote hain jab aap Destructive Changes (Table drop karna ya Column delete karna) karte ho.

1. Local Dev ko Prod se Sync kaise karein?
   Drizzle mein prod ka schema local par laane ke liye ye steps best hain:
   Schema Sync: Local schema.ts ko Prod ke barabar rakho.
   Data Sync (The Easy Way): Turso ka db shell use karke prod ka data dump lo (jo tune abhi seekha) aur local SQLite file mein load kar lo:

# Prod se dump lo

turso db shell prod-db-name .dump > prod_data.sql

# Local SQLite file mein load karo

sqlite3 local.db < prod_data.sql

Is Error Ka Map (Cheat Sheet)
Error Line Ka Hissa Iska Matlab Kya Hai?
Type 'X' is not assignable to type 'Y' X (Server ka data) aur Y (Aapka Interface) match nahi ho rahe.
Property 'totalQuestions' are incompatible Poore object mein se sirf is ek column mein lafda hai.
Type 'null' is not assignable to type 'number' ASLI WAJAH: Server keh raha hai "Data gayab ho sakta hai", Interface keh raha hai "Data pakka chahiye".
