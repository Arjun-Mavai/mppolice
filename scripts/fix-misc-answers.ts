/**
 * fix-misc-answers.ts
 * ─────────────────────────────────────────────────────────────
 * MISC (free quiz) tests ke correctAnswer ko text/letter se
 * numeric index (0,1,2,3) me convert karo.
 *
 * Usage: npx tsx scripts/fix-misc-answers.ts
 */

import { createClient } from '@libsql/client';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  // 1. MISC tests dhundho
  const testsResult = await client.execute(
    "SELECT id, title FROM tests WHERE type = 'MISC'"
  );

  if (testsResult.rows.length === 0) {
    console.log('No MISC tests found.');
    return;
  }

  console.log(`Found ${testsResult.rows.length} MISC test(s):\n`);

  let totalFixed = 0;

  for (const test of testsResult.rows) {
    const testId = test.id as string;
    const title = test.title as string;
    console.log(`── ${title} (${testId})`);

    // 2. Questions fetch karo
    const questionsResult = await client.execute({
      sql: 'SELECT id, correct_answer, options FROM questions WHERE test_id = ?',
      args: [testId],
    });

    let fixed = 0;

    for (const q of questionsResult.rows) {
      const qId = q.id as string;
      const currentAnswer = String(q.correct_answer).trim();

      // Already numeric? skip
      const num = Number(currentAnswer);
      if (!isNaN(num) && Number.isFinite(num)) continue;

      // Letter A-D?
      if (/^[A-Da-d]$/.test(currentAnswer)) {
        const idx = currentAnswer.toUpperCase().charCodeAt(0) - 65;
        await client.execute({
          sql: 'UPDATE questions SET correct_answer = ? WHERE id = ?',
          args: [String(idx), qId],
        });
        console.log(`   ✅ "${currentAnswer}" → ${idx}`);
        fixed++;
        continue;
      }

      // Full text match — options me dhundho
      let options: any[] = [];
      try {
        let raw: any = q.options;
        // Double-encoded ho sakta h — parse until array milta h
        if (typeof raw === 'string') raw = JSON.parse(raw);
        if (typeof raw === 'string') raw = JSON.parse(raw);
        options = Array.isArray(raw) ? raw : [];
      } catch {
        console.log(`   ⚠️  Q ${qId}: options parse fail, skipping`);
        continue;
      }

      const matchIdx = options.findIndex((opt: any) => {
        const text = typeof opt === 'string' ? opt : (opt?.text || opt?.textEn || '');
        return String(text).trim() === currentAnswer;
      });

      if (matchIdx !== -1) {
        await client.execute({
          sql: 'UPDATE questions SET correct_answer = ? WHERE id = ?',
          args: [String(matchIdx), qId],
        });
        console.log(`   ✅ "${currentAnswer.substring(0, 40)}..." → ${matchIdx}`);
        fixed++;
      } else {
        console.log(`   ❌ Q ${qId}: no match for "${currentAnswer.substring(0, 50)}"`);
      }
    }

    console.log(`   Fixed: ${fixed}/${questionsResult.rows.length}\n`);
    totalFixed += fixed;
  }

  console.log(`\n🎉 Done! Total fixed: ${totalFixed} questions`);
}

main().catch(console.error);
