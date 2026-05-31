import { db } from '@/db';
import { guests, testFeedback } from '@/db/schema';
import { count, avg, eq, and } from 'drizzle-orm';

/**
 * 📊 TELEGRAM STATS LOADER
 * 
 * Fetches global metrics to show growth and quality in Telegram notifications.
 * Includes:
 * 1. Total Unique Leads (from guests table)
 * 2. Feedback metrics (total and average rating)
 * 3. Rating distribution (1-5 stars)
 */
export async function getTelegramStatsSummary() {
  try {
    // 1. Total unique guest leads for mppolice
    const [leadsCount] = await db.select({ value: count() })
      .from(guests)
      .where(eq(guests.examType, 'mppolice'));
    
    // 2. Total feedback count and avg rating for mppolice
    const [feedbackStats] = await db
      .select({ 
        total: count(),
        average: avg(testFeedback.overallRating)
      })
      .from(testFeedback)
      .where(eq(testFeedback.examType, 'mppolice'));
      
    // 3. Star distribution — Optimized with single GROUP BY
    const distributionRows = await db
      .select({ 
        rating: testFeedback.overallRating,
        count: count()
      })
      .from(testFeedback)
      .where(eq(testFeedback.examType, 'mppolice'))
      .groupBy(testFeedback.overallRating);

    const distribution: Record<number, number> = {};
    distributionRows.forEach(row => {
      if (row.rating) distribution[row.rating] = row.count;
    });

    const stars = [5, 4, 3, 2, 1];
    const totalF = feedbackStats.total || 0;
    const avgR = feedbackStats.average ? parseFloat(String(feedbackStats.average)).toFixed(1) : '0';

    // Format the distribution into a visual bar chart for Telegram
    const distributionStr = stars.map(star => {
      const countVal = distribution[star] || 0;
      const percentage = totalF > 0 ? (countVal / totalF) * 10 : 0;
      // Using solid and light blocks for the bar
      const bar = '█'.repeat(Math.round(percentage)).padEnd(10, '░');
      return `${star} ⭐: ${String(countVal).padEnd(3)} [${bar}]`;
    }).join('\n');

    return (
      `📈 <b>GLOBAL PLATFORM STATS</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👥 <b>Total Guest Leads:</b> ${leadsCount.value}\n` +
      `📝 <b>Total Feedbacks:</b> ${totalF}\n` +
      `🌟 <b>Avg Rating:</b> ${avgR} / 5\n\n` +
      `<b>Rating Distribution:</b>\n` +
      `<pre>${distributionStr}</pre>\n` +
      `━━━━━━━━━━━━━━━━`
    );
  } catch (error) {
    console.error('Error loading telegram stats:', error);
    return ''; // Return empty so it doesn't crash the main notification
  }
}
