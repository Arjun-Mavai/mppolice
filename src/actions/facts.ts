'use server';

import { db } from '@/db';
import { questions } from '@/db/schema';
import { sql, isNotNull, and, not, eq } from 'drizzle-orm';

export interface Fact {
  id: string;
  text: string;
}

export async function getRandomFacts(limit: number = 5): Promise<Fact[]> {
  try {
    // We want short, useful explanations. 
    // Length check is approximate in SQL.
    const results = await db
      .select({
        id: questions.id,
        explanation: questions.explanation,
      })
      .from(questions)
      .where(
        and(
          isNotNull(questions.explanation),
          not(eq(questions.explanation, '')),
          sql`LENGTH(${questions.explanation}) BETWEEN 50 AND 300`
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    return results.map(r => ({
      id: r.id,
      text: r.explanation || '',
    }));
  } catch (error) {
    console.error('Error fetching random facts:', error);
    return [];
  }
}
