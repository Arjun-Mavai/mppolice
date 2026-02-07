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

caching

            // Function to get user profile
            const getUserProfile = unstable_cache(
              async (userId) => { /* ... */ },
              ['user-profile', userId.toString()],
              { tags: ['users', `user-${userId}`], revalidate: 3600 } // <-- 'tags' array here
            );

            // Function to get all users
            const getAllUsers = unstable_cache(
              async () => { /* ... */ },
              ['all-users'],
              { tags: ['users'], revalidate: 3600 } // <-- 'tags' array here
            );
            ```

            यहां, `getUserProfile` और `getAllUsers` दोनों `users` टैग का उपयोग कर रहे हैं।

**Caching किस level पर store होती है (Server पर या Browser पर)?**

`unstable_cache` द्वारा की गई caching **पूरी तरह से Vercel के सर्वर-साइड इंफ्रास्ट्रक्चर (Next.js Data Cache) पर स्टोर होती है।**

- **यह ब्राउज़र पर स्टोर नहीं होती है।** ब्राउज़र का cache अलग होता है और HTTP `Cache-Control` हेडर द्वारा नियंत्रित होता है। `unstable_cache` सीधे ब्राउज़र cache को प्रभावित नहीं करता है।
- **Feel:** सोचिए, `unstable_cache` एक किचन के अंदर एक विशेष रेफ्रिजरेटर की तरह है, जहां शेफ (आपका सर्वर) अपने तैयार किए गए कुछ हिस्सों को स्टोर करता है। ग्राहक (ब्राउज़र) को इसकी सीधी जानकारी नहीं होती कि रेफ्रिजरेटर में क्या है। ग्राहक को तो बस तैयार डिश (server-rendered HTML/RSC payload) मिलती है।

**Invalidate कैसे करते हैं?**

`unstable_cache` द्वारा cache किए गए डेटा को अमान्य (invalidate) करने के मुख्य दो तरीके हैं:

1.  **Time-based Revalidation (`revalidate` option):**
    - यह `unstable_cache` के `options` ऑब्जेक्ट में `revalidate: <seconds>` property सेट करके किया जाता है।
    - Next.js स्वचालित रूप से इस cache entry को `revalidate` value के बाद stale मानेगा। जब कोई नई request आती है और cache stale हो चुकी होती है, तो Next.js background में नया डेटा fetch करेगा (stale-while-revalidate की तरह काम करता है), और अगली request से नया डेटा serve किया जाएगा।
    - **कहां पर:** `unstable_cache` definition के अंदर।
    - **Feel:** आपने शेफ के रेफ्रिजरेटर में रखी डिश पर "1 घंटा बाद फेंक दो" का लेबल लगा दिया। 1 घंटे बाद, अगली बार जब शेफ उसे लेने जाएगा, तो वह उसे फेंक देगा और नया बनाएगा।

2.  **On-demand Revalidation (using `revalidateTag`):**
    - यह तब उपयोग होता है जब आप तुरंत cache को अमान्य करना चाहते हैं, उदाहरण के लिए, जब डेटाबेस में बदलाव होता है।
    - आप Next.js द्वारा प्रदान किए गए `revalidateTag` function का उपयोग करते हैं।
    - **कहां पर:** आमतौर पर एक **Route Handler** (API route) में, जो डेटाबेस अपडेट होने के बाद या webhook ट्रिगर होने पर कॉल किया जाता है।
    - **Syntax:**

      ```javascript
      // In a Route Handler (e.g., app/api/revalidate-users/route.js)
      import { NextResponse } from "next/server";
      import { revalidateTag } from "next/cache"; // Import from next/cache

      export async function GET(request) {
        // You might want to add authentication/authorization here
        // to prevent unauthorized revalidation

        revalidateTag("users"); // This will revalidate all cache entries with the 'users' tag
        revalidateTag("products"); // Or any other tag you want to revalidate

        return NextResponse.json({ revalidated: true, now: Date.now() });
      }
      ```

    - **Feel:** आपने शेफ के रेफ्रिजरेटर में रखी "फैंटेसी" टैग वाली सारी डिशों पर एक बटन लगा दिया। जब आप उस बटन को दबाते हैं (API call), तो "फैंटेसी" टैग वाली सभी डिशें तुरंत रेफ्रिजरेटर से हटा दी जाती हैं। अगली बार जब शेफ को फैंटेसी डिश चाहिए होगी, तो उसे फिर से बनानी पड़ेगी।

**संक्षेप में:**

- **`keys`**: आपके cache entry की यूनीक पहचान, जो फंक्शन के इनपुट पर निर्भर करती है। जैसे किताब का ISBN।
- **`tags`**: कई cache entries को ग्रुप करने का तरीका, ताकि उन्हें एक साथ invalidate किया जा सके। जैसे किताब का Genre।
- **Storage**: `unstable_cache` सर्वर-साइड (Vercel Data Cache) पर स्टोर होता है।
- **Invalidation**:
  - **Time-based**: `revalidate` option के साथ automatic revalidation।
  - **On-demand**: `revalidateTag()` फंक्शन का उपयोग करके programmatic revalidation, आमतौर पर डेटा अपडेट के बाद।

यह समझकर कि `tags` और `keys` कैसे काम करते हैं, आप अपनी Next.js एप्लिकेशन में डेटा caching को बहुत प्रभावी ढंग से मैनेज कर सकते हैं, जिससे performance में काफी सुधार होता है और server load कम होता है! प्रभावी ढंग से मैनेज कर सकते हैं, जिससे performance में काफी सुधार होता है और server load कम होता है!

https://share.google/aimode/R5a8ZVmuLM8r0HSmU

https://share.google/aimode/w6s1aAbEvX89RnDJE

vercel bandwithh 100GB
100000MB/30days = 3333MB daily limit

Saral shabdon mein, agar aapki website ka size 1 MB hai, toh rozana 3,333 users bina kisi extra charge ke site dekh sakte hain. Agar aap page size 0.5 MB kar dete ho, toh ye capacity badhkar 6,666 users ho jayegi.

3333MB daily limit/1MB = 3333 users / day

Bilkul bhai 😄
Neeche maine **proper Markdown (.md) format** mein, clean headings, bullets aur table ke saath tod-fod karke likh diya hai. Seedha copy–paste karke MD file bana sakta hai 👇

---

# Regex Explanation – Negative Lookahead with `:path`

## 1. General Syntax Breakdown

### **Syntax**

```
:path((?!word1|word2).+)
```

### **Har Part Ka Matlab**

- **`:path`**
  - Yeh ek **placeholder / variable** hai
  - `/syllabus/` ke baad aane wale URL part ko capture karta hai

- **`()`**
  - Iske andar hum **rules / conditions** likhte hain

- **`?!` (Negative Lookahead)**
  - Matlab: **"yeh cheez nahi honi chahiye"**
  - Agar condition match ho gayi → regex fail ho jayega

- **`word1 | word2`**
  - Allowed words ki list
  - `|` ka matlab **OR** (ya toh yeh, ya woh)

- **`$`**
  - **Exact end of string**
  - Yeh ensure karta hai ki sirf wahi word ho, aage kuch aur nahi

- **`.+`**
  - **Koi bhi character (1 ya usse zyada)**
  - Matlab: empty nahi hona chahiye

---

## 2. Yeh Kaam Kaise Karta Hai? (Real Examples)

| URL Jo User Ne Khola | Regex Match Hua? | Reason                      | Action              |
| -------------------- | ---------------- | --------------------------- | ------------------- |
| `/syllabus/quiz`     | ❌ Nahi          | `quiz` allow list mein hai  | Page Khul Jayega ✅ |
| `/syllabus/units`    | ❌ Nahi          | `units` allow list mein hai | Page Khul Jayega ✅ |
| `/syllabus/quiz/123` | ✅ Haan          | Exact `quiz` nahi hai       | Block / Redirect ❌ |
| `/syllabus/random`   | ✅ Haan          | Allow list mein nahi hai    | Block / Redirect ❌ |

---

## 3. Simple Language Mein Summary

- ✅ **Sirf exact** `/syllabus/quiz` aur `/syllabus/units` allowed hain
- ❌ Agar unke baad **kuch bhi extra** aa gaya → block ho jayega
- ❌ Jo words allow list mein nahi hain → block / redirect

---

## 4. One-Line Samajh Lo 😎

> "`/syllabus/` ke baad agar **exact allow kiye hue words** ke alawa kuch bhi aaya, toh usko andar nahi aane dena."

---

Agar chahe toh main:

- isko **Express / Next.js / Nginx route** ke example mein dikha doon
- ya regex ko aur **optimize / simplify** karke de doon

Bas bol 👊
https://shadcnstudio.com/#pricing

1. source: '/:path\*'
   Iska matlab hai ye rules website ke har ek page par lagu honge. Chahe wo home page ho ya /syllabus ka koi deep link.
2. Headers ka Post-Mortem:
   Header Kya kaam karta hai? (Simple Feel)
   X-DNS-Prefetch-Control Browser ko bolta hai ki links ko pehle se scan kar lo taaki click karte hi page jaldi khule.
   Strict-Transport-Security (HSTS) Ye browser ko order deta hai: "Sirf https par hi khulna, bina security (http) ke mat khulna." Ye 2 saal (max-age) tak yaad rakhta hai.
   X-XSS-Protection Agar koi hacker tumhari site mein galat code (script) ghusane ki koshish karega, toh browser usse block kar dega.
   X-Frame-Options: SAMEORIGIN Iska matlab hai ki tumhari website ko koi doosra banda apni site ke andar (frame mein) nahi dikha sakta. Ye "Clickjacking" se bachata hai.
   X-Content-Type-Options: nosniff Browser bahut shana banta hai, kabhi kabhi file type khud guess karta hai. Ye header bolta hai: "Apna dimaag mat lagao, jo server ne bola hai wahi file type maano."
   Referrer-Policy Jab koi user tumhari site se kisi doosri site par jayega, toh tumhari site ki kitni jankari (URL) doosre ko deni hai, ye wo control karta hai.
   Summary (Moti baat)
   Ye saari cheezein tumhari website ko Safe aur Fast banane ke liye hain.
   Security: Hacker tumhari site ko copy nahi kar payenge, galat script nahi chala payenge.
   Trust: Browser ko pata hoga ki ye ek professional aur secure site hai.
   Kya tumne ye code kisi security audit ke baad dala hai, ya boilerplate (readymade) code use kiya hai? (Donon hi achhi baat hain, kyunki ye best practices hain!)
