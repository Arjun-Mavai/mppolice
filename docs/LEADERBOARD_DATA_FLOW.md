# 🎯 LEADERBOARD DATA FLOW - Exact Details

> **Bhai, ab bilkul precise samjhte hain - fake users kahan, real users kab, kaise connect!**

---

## 🗄️ Database Tables (Clear Picture)

### Tables Overview:

```
┌────────────────────────────────────────────────────────────┐
│              DATABASE TABLES                                │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. mppsc_users (Real users ONLY)                          │
│     - Actual user accounts                                 │
│     - Email, password, name                                │
│     - NO fake users here!                                  │
│                                                             │
│  2. user_attempts (Real user attempts ONLY)                │
│     - Actual test attempts                                 │
│     - userId, testId, score, time                          │
│     - NO fake attempts here!                               │
│                                                             │
│  3. test_leaderboard (BOTH real + fake) ← NEW TABLE        │
│     - Fake users: isFake = 1                               │
│     - Real users: isFake = 0                               │
│     - Display names, scores, ranks                         │
│     - ONLY for display purpose!                            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Point: Fake Users ONLY in Leaderboard Table

### Architecture:

```
mppsc_users table:
┌────────────────┬──────────────────┬──────────┐
│ id             │ email            │ name     │
├────────────────┼──────────────────┼──────────┤
│ user_arjun_123 │ arjun@email.com  │ Arjun    │  ← Real user
│ user_priya_456 │ priya@email.com  │ Priya    │  ← Real user
└────────────────┴──────────────────┴──────────┘
                  ↑
            ONLY REAL USERS!
            No fake users here!


user_attempts table:
┌────────────┬────────────────┬───────────────┬───────┐
│ id         │ userId         │ testId        │ score │
├────────────┼────────────────┼───────────────┼───────┤
│ attempt_1  │ user_arjun_123 │ test_hist_101 │ 14.0  │  ← Real attempt
│ attempt_2  │ user_priya_456 │ test_hist_101 │ 15.0  │  ← Real attempt
└────────────┴────────────────┴───────────────┴───────┘
                  ↑
            ONLY REAL ATTEMPTS!
            No fake attempts here!


test_leaderboard table: ← NEW TABLE (Display only!)
┌─────────┬───────────────┬───────────────┬───────┬──────┬────────┐
│ id      │ testId        │ displayName   │ score │ rank │ isFake │
├─────────┼───────────────┼───────────────┼───────┼──────┼────────┤
│ fake_1  │ test_hist_101 │ Priya Sharma  │ 18.0  │ 1    │ 1      │ ← Fake
│ fake_2  │ test_hist_101 │ Rahul Verma   │ 17.0  │ 2    │ 1      │ ← Fake
│ fake_3  │ test_hist_101 │ Anjali Singh  │ 16.0  │ 3    │ 1      │ ← Fake
│ ...     │ ...           │ ...           │ ...   │ ...  │ ...    │
│ fake_50 │ test_hist_101 │ Vikram Rao    │ 8.0   │ 50   │ 1      │ ← Fake
│ real_1  │ test_hist_101 │ Arjun Kumar   │ 14.0  │ 25   │ 0      │ ← Real (from user_arjun_123)
│ real_2  │ test_hist_101 │ Priya Singh   │ 15.0  │ 18   │ 0      │ ← Real (from user_priya_456)
└─────────┴───────────────┴───────────────┴───────┴──────┴────────┘
                              ↑
                    BOTH FAKE + REAL!
                    For ranking display only!
```

---

## 🔗 Connection Between Tables

```
USER LIFECYCLE:
───────────────

1. User Registration:
   INSERT INTO mppsc_users (id, email, name, ...)
   → Creates account
   → Can login
   
2. User Takes Test:
   INSERT INTO user_attempts (id, userId, testId, score, ...)
   → Records actual attempt
   → Real data for analytics
   
3. User Sees Leaderboard:
   INSERT INTO test_leaderboard (id, testId, displayName, score, isFake=0)
   → Copy from user_attempts
   → Mix with fake users
   → Display ranking


CONNECTION:
───────────

mppsc_users.id ──→ user_attempts.userId
                   ↓
                   (Copy relevant data)
                   ↓
                   test_leaderboard.userId + displayName


FAKE USERS:
───────────

test_leaderboard ONLY!
  - userId = NULL (no link to mppsc_users)
  - displayName = "Priya Sharma" (just a string)
  - isFake = 1
  - No corresponding entry in mppsc_users or user_attempts!
```

---

## 📋 Leaderboard Table Schema (Complete)

```sql
CREATE TABLE test_leaderboard (
    -- Unique identifier
    id TEXT PRIMARY KEY,              -- "fake_1" or "real_abc"
    
    -- Which test this belongs to
    testId TEXT NOT NULL,             -- "test_history_101"
    
    -- Link to real user (NULL for fake users)
    userId TEXT,                      -- "user_arjun_123" or NULL
    
    -- Display name on leaderboard
    displayName TEXT NOT NULL,        -- "Priya Sharma" or "Arjun Kumar"
    
    -- Performance metrics
    score REAL NOT NULL,              -- 14.5
    percentage REAL,                  -- 72.5
    timeTakenSeconds INTEGER,         -- 525 (8m 45s)
    
    -- Ranking
    rank INTEGER,                     -- 25
    
    -- Identify fake vs real
    isFake INTEGER DEFAULT 0,         -- 0 = real, 1 = fake
    
    -- Timestamp
    createdAt INTEGER,                -- Unix timestamp
    
    -- Foreign key (optional)
    FOREIGN KEY (testId) REFERENCES tests(id),
    FOREIGN KEY (userId) REFERENCES mppsc_users(id)
);

-- Indexes for fast queries
CREATE INDEX idx_leaderboard_test ON test_leaderboard(testId, rank);
CREATE INDEX idx_leaderboard_user ON test_leaderboard(userId);
```

---

## 🔄 COMPLETE FLOW - User Takes Test

### Timeline of Events:

```
┌─────────────────────────────────────────────────────────────┐
│  USER TEST SUBMISSION - EXACT DATA FLOW                     │
└─────────────────────────────────────────────────────────────┘

T0: User (Arjun) clicks "Start Test"
────────────────────────────────────
- Frontend loads test: test_history_101
- Questions displayed
- Timer starts


T1: User submits test
─────────────────────
- Frontend collects answers
- Sends to server:
  {
    userId: "user_arjun_123",
    testId: "test_history_101",
    answers: { q1: 0, q2: 1, ... },
    startTime: 1707213000,
    endTime: 1707213525
  }


T2: Server calculates score
───────────────────────────
- Loop through answers
- Check correct/wrong
- Calculate: 14/20 marks
- Calculate time: 525 seconds (8m 45s)


T3: Save to user_attempts (REAL DATA)
─────────────────────────────────────
INSERT INTO user_attempts VALUES (
  'attempt_abc_123',        -- New attempt ID
  'user_arjun_123',         -- User ID (from mppsc_users)
  'test_history_101',       -- Test ID
  1707213000,               -- Start time
  1707213525,               -- End time
  14.0,                     -- Score
  1                         -- isCompleted
);

INSERT INTO attempt_answers VALUES
  ('ans_1', 'attempt_abc_123', 'q_1', '0', 1, 45),
  ('ans_2', 'attempt_abc_123', 'q_2', '1', 0, 30),
  ...;

✅ REAL user data saved in normal tables!


T4: Check if leaderboard exists
───────────────────────────────
Query:
  SELECT COUNT(*) FROM test_leaderboard 
  WHERE testId = 'test_history_101'

Result: 0 (no entries yet)

Decision: GENERATE FAKE LEADERBOARD!


T5: Generate 50 fake users (ONE-TIME)
─────────────────────────────────────
FOR i = 1 to 50:
  fakeName = FAKE_USERS[i]  // "Priya Sharma"
  fakeScore = generateRandomScore(i)  // 18.5, 17.0, etc.
  fakeTime = generateRandomTime()     // 450, 480, etc.
  
  INSERT INTO test_leaderboard VALUES (
    'fake_' + testId + '_' + i,  -- "fake_test_history_101_1"
    'test_history_101',          -- Test ID
    NULL,                        -- userId = NULL (no real user!)
    fakeName,                    -- "Priya Sharma"
    fakeScore,                   -- 18.5
    (fakeScore/20)*100,          -- 92.5%
    fakeTime,                    -- 450 seconds
    0,                           -- Rank (will calculate later)
    1,                           -- isFake = 1 (FAKE USER!)
    Date.now()                   -- Current timestamp
  );

✅ 50 fake entries inserted!


T6: Add REAL user to leaderboard
────────────────────────────────
Get user's name:
  SELECT name FROM mppsc_users 
  WHERE id = 'user_arjun_123'
  
  Result: "Arjun Kumar"

Insert to leaderboard:
  INSERT INTO test_leaderboard VALUES (
    'real_' + userId + '_' + testId,  -- "real_user_arjun_123_test_history_101"
    'test_history_101',               -- Test ID
    'user_arjun_123',                 -- userId (links to mppsc_users!)
    'Arjun Kumar',                    -- Display name
    14.0,                             -- Score (from user_attempts)
    70.0,                             -- Percentage
    525,                              -- Time taken (from user_attempts)
    0,                                -- Rank (will calculate)
    0,                                -- isFake = 0 (REAL USER!)
    Date.now()
  );

✅ Real user added to leaderboard!


T7: Sort and calculate ranks
────────────────────────────
Query:
  SELECT * FROM test_leaderboard
  WHERE testId = 'test_history_101'
  ORDER BY score DESC, timeTakenSeconds ASC

Result (sorted):
  1. Priya Sharma (fake): 18.5
  2. Rahul Verma (fake): 17.0
  3. Anjali Singh (fake): 16.5
  ...
  25. Arjun Kumar (REAL): 14.0  ← User's position!
  ...
  51. Vikram Rao (fake): 6.5

Update ranks:
  UPDATE test_leaderboard 
  SET rank = 1 
  WHERE id = 'fake_test_history_101_1'
  
  UPDATE test_leaderboard 
  SET rank = 2 
  WHERE id = 'fake_test_history_101_2'
  
  ...
  
  UPDATE test_leaderboard 
  SET rank = 25 
  WHERE id = 'real_user_arjun_123_test_history_101'
  
  ...

✅ All ranks calculated!


T8: Return leaderboard to frontend
──────────────────────────────────
Query top 10:
  SELECT * FROM test_leaderboard
  WHERE testId = 'test_history_101'
  ORDER BY rank ASC
  LIMIT 10

Query user's entry:
  SELECT * FROM test_leaderboard
  WHERE testId = 'test_history_101' 
  AND userId = 'user_arjun_123'

Return JSON:
  {
    userRank: 25,
    totalParticipants: 51,
    userEntry: {
      displayName: "Arjun Kumar",
      score: 14.0,
      rank: 25,
      timeTaken: 525
    },
    top10: [
      { rank: 1, displayName: "Priya Sharma", score: 18.5, ... },
      { rank: 2, displayName: "Rahul Verma", score: 17.0, ... },
      ...
    ]
  }


T9: Frontend displays leaderboard
─────────────────────────────────
Shows UI with:
- "Your Rank: #25 / 51"
- Top 10 list
- User's highlighted position
```

---

## 🔍 Field-by-Field Breakdown

### test_leaderboard Table Fields:

```sql
┌──────────────────┬──────────────┬─────────────────────────────────┐
│ Field            │ Type         │ Purpose                         │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ id               │ TEXT (PK)    │ Unique identifier               │
│                  │              │ "fake_1" or "real_abc"          │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ testId           │ TEXT (FK)    │ Which test is this for?         │
│                  │              │ Links to: tests.id              │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ userId           │ TEXT (FK)    │ Real user ID (NULL for fake)    │
│                  │              │ Links to: mppsc_users.id        │
│                  │              │ Example:                        │
│                  │              │ - Real: "user_arjun_123"        │
│                  │              │ - Fake: NULL                    │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ displayName      │ TEXT         │ Name shown on leaderboard       │
│                  │              │ Example:                        │
│                  │              │ - Real: "Arjun Kumar"           │
│                  │              │ - Fake: "Priya Sharma"          │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ score            │ REAL         │ Marks obtained                  │
│                  │              │ Example: 14.5                   │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ percentage       │ REAL         │ (score/totalMarks)*100          │
│                  │              │ Example: 72.5                   │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ timeTakenSeconds │ INTEGER      │ How long to complete test       │
│                  │              │ Example: 525 (8m 45s)           │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ rank             │ INTEGER      │ Calculated position             │
│                  │              │ Example: 25                     │
│                  │              │ Sorted by: score DESC, time ASC │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ isFake           │ INTEGER      │ 0 = Real user, 1 = Fake user    │
│                  │              │ Used to filter/manage           │
├──────────────────┼──────────────┼─────────────────────────────────┤
│ createdAt        │ INTEGER      │ Timestamp when entry created    │
│                  │              │ Unix timestamp                  │
└──────────────────┴──────────────┴─────────────────────────────────┘
```

---

## 📊 Data Examples (Real vs Fake)

### Fake User Entry:

```sql
INSERT INTO test_leaderboard VALUES (
  'fake_test_history_101_1',   -- id (unique)
  'test_history_101',           -- testId
  NULL,                         -- userId (NULL = no real user!)
  'Priya Sharma',               -- displayName (just a string)
  18.5,                         -- score (randomly generated)
  92.5,                         -- percentage
  450,                          -- timeTakenSeconds (random)
  1,                            -- rank
  1,                            -- isFake = 1 (THIS IS FAKE!)
  1707213600                    -- createdAt
);
```

**Key Point**: 
- ❌ No entry in `mppsc_users` for "Priya Sharma"
- ❌ No entry in `user_attempts`
- ✅ Only exists in `test_leaderboard`!

---

### Real User Entry:

```sql
INSERT INTO test_leaderboard VALUES (
  'real_user_arjun_123_test_history_101',  -- id (unique)
  'test_history_101',                      -- testId
  'user_arjun_123',                        -- userId (LINKS TO mppsc_users!)
  'Arjun Kumar',                           -- displayName (from mppsc_users.name)
  14.0,                                    -- score (from user_attempts.score)
  70.0,                                    -- percentage
  525,                                     -- timeTakenSeconds (from user_attempts)
  25,                                      -- rank
  0,                                       -- isFake = 0 (THIS IS REAL!)
  1707213600                               -- createdAt
);
```

**Key Point**:
- ✅ Entry exists in `mppsc_users` (id: user_arjun_123)
- ✅ Entry exists in `user_attempts` (with full attempt data)
- ✅ Also copied to `test_leaderboard` for ranking display!

---

## 🎯 When Real User Data is Added to Leaderboard

### Exact Point in Code:

```typescript
// src/actions/test-actions.ts

export async function submitTestAttempt(data) {
  // 1. Calculate score
  const score = calculateScore(data.answers);
  const timeTaken = data.endTime - data.startTime;
  
  // 2. Save to user_attempts (REAL DATA TABLE)
  const attemptId = await db.insert(userAttempts).values({
    id: generateId(),
    userId: data.userId,      // Real user ID
    testId: data.testId,
    score: score,
    startTime: data.startTime,
    endTime: data.endTime,
    isCompleted: true
  });
  
  // 3. Save individual answers
  await db.insert(attemptAnswers).values(
    data.answers.map(ans => ({
      attemptId: attemptId,
      questionId: ans.questionId,
      userAnswer: ans.userAnswer,
      isCorrect: ans.isCorrect,
      timeTaken: ans.timeTaken
    }))
  );
  
  // 4. NOW add to leaderboard! ← THIS IS THE POINT!
  await addToLeaderboard({
    testId: data.testId,
    userId: data.userId,
    score: score,
    timeTaken: timeTaken
  });
  
  return { attemptId, score };
}

// Separate function for leaderboard
async function addToLeaderboard(data) {
  // Check if leaderboard exists
  const exists = await db.select()
    .from(testLeaderboard)
    .where(eq(testLeaderboard.testId, data.testId))
    .limit(1);
  
  // If not exists, generate fake users first
  if (exists.length === 0) {
    await generateFakeLeaderboard(data.testId);
  }
  
  // Get user's name
  const user = await db.select()
    .from(mppscUsers)
    .where(eq(mppscUsers.id, data.userId))
    .limit(1);
  
  // Add real user to leaderboard
  await db.insert(testLeaderboard).values({
    id: `real_${data.userId}_${data.testId}`,
    testId: data.testId,
    userId: data.userId,           // ← Links to mppsc_users
    displayName: user[0].name,
    score: data.score,
    percentage: (data.score / totalMarks) * 100,
    timeTakenSeconds: data.timeTaken,
    rank: 0,                       // Will calculate after sorting
    isFake: 0,                     // ← REAL USER!
    createdAt: Date.now()
  });
  
  // Recalculate all ranks
  await recalculateRanks(data.testId);
}
```

---

## 🔄 Second User Takes Same Test

```
SCENARIO: Priya takes test_history_101
───────────────────────────────────────

Step 1: Priya submits test
  Score: 15/20
  Time: 480 seconds

Step 2: Save to user_attempts
  INSERT INTO user_attempts (userId='user_priya_456', score=15, ...)

Step 3: Check leaderboard exists?
  SELECT COUNT(*) FROM test_leaderboard WHERE testId='test_history_101'
  Result: 51 (already exists! 50 fake + 1 real from Arjun)

Step 4: Skip fake generation! (already done by Arjun)

Step 5: Just add Priya to leaderboard
  INSERT INTO test_leaderboard VALUES (
    'real_user_priya_456_test_history_101',
    'test_history_101',
    'user_priya_456',      ← Real user ID
    'Priya Singh',
    15.0,
    75.0,
    480,
    0,
    0,                     ← Real user
    Date.now()
  );

Step 6: Re-sort and re-rank (52 total now)
  1. Priya Sharma (fake): 18.5
  2. Rahul Verma (fake): 17.0
  ...
  18. Priya Singh (REAL): 15.0  ← New user!
  ...
  25. Arjun Kumar (REAL): 14.0  ← Original user (rank unchanged)
  ...
  52. Vikram Rao (fake): 6.5
```

---

## 🎯 Summary (Crystal Clear)

### Where are Fake Users?

```
✅ ONLY in: test_leaderboard table
❌ NOT in: mppsc_users table
❌ NOT in: user_attempts table
❌ NOT in: attempt_answers table
```

### When is Real User Added to Leaderboard?

```
Timeline:
1. User submits test
2. Server calculates score
3. Save to user_attempts (real data) ← First!
4. Check if leaderboard exists
5. If not, generate 50 fake users
6. Add real user to leaderboard ← This point!
7. Sort and calculate ranks
8. Return to frontend
```

### Fields in Leaderboard:

```
Fake User:
  userId: NULL
  displayName: "Priya Sharma" (from array)
  isFake: 1

Real User:
  userId: "user_arjun_123" (from mppsc_users)
  displayName: "Arjun Kumar" (from mppsc_users.name)
  isFake: 0
```

### Connection:

```
user_attempts.userId ──→ mppsc_users.id
        ↓
   (copy data)
        ↓
test_leaderboard.userId + displayName
```

---

**Bhai, ab bilkul clear ho gaya? Fake users sirf leaderboard table mein, real users puri tarah tracked hain!** 🎯

