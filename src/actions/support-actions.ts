'use server';

import { db } from '@/db';
import { supportTickets, mppscUsers } from '@/db/schema';
import { eq, desc, or } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { sendTelegramNotification, escapeHTML } from '@/lib/telegram';

export async function submitSupportTicket(data: any) {
  try {
    const { name, email, phone, category, message, userId } = data;

    if (!name || !email || !message) {
      return { success: false, error: 'Missing required fields' };
    }

    await db.insert(supportTickets).values({
      id: crypto.randomUUID(),
      userId: userId || null,
      name,
      email,
      phone: phone || null,
      category: category || 'general',
      message,
      status: 'open',
      examType: 'mppolice',
      createdAt: new Date(),
    });

    // 🚀 Send Telegram Notification
    try {
      const tgMessage = `🎫 <b>NEW SUPPORT TICKET!</b>\n\n` +
        `👤 <b>Name:</b> ${escapeHTML(name)}\n` +
        `📧 <b>Email:</b> ${escapeHTML(email)}\n` +
        `📞 <b>Phone:</b> ${phone ? escapeHTML(phone) : 'N/A'}\n` +
        `🗂️ <b>Category:</b> ${escapeHTML(category || 'general').toUpperCase()}\n\n` +
        `📝 <b>Message:</b>\n<i>"${escapeHTML(message)}"</i>\n\n` +
        `📥 <i>Check Admin Dashboard to reply or close.</i>`;
      
      await sendTelegramNotification(tgMessage);
    } catch (tgErr) {
      logger.error('Telegram support ticket notification failed', tgErr);
    }

    // revalidatePath('/admin/dashboard'); // If we show tickets there
    return { success: true };
  } catch (error) {
    logger.error('Support Ticket Error:', error);
    return { success: false, error: 'Failed to submit ticket' };
  }
}

export async function getSupportTickets() {
  // Admin only
  const user = await verifyAuth();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Check admin role
  const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
  if (!dbUser || dbUser.role !== 'admin') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const tickets = await db
      .select()
      .from(supportTickets)
      .where(
        or(
          eq(supportTickets.examType, 'mppolice'),
          eq(supportTickets.examType, 'all')
        )
      )
      .orderBy(desc(supportTickets.createdAt));
    return { success: true, tickets };
  } catch (error) {
    return { success: false, error: 'Failed to fetch tickets' };
  }
}
