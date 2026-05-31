'use server';

import { db } from '@/db';
import { intelligenceFeedback } from '@/db/schema';
import { sendTelegramNotification, escapeHTML } from '@/lib/telegram';
import { randomUUID } from 'crypto';

export type IntelligenceReaction = 'helpful' | 'insightful' | 'unhelpful' | 'doubt';

export interface IntelligenceFeedbackData {
  guestMobile?: string;
  questionId: string;
  questionText: string;
  testId?: string;
  reaction: IntelligenceReaction;
  message?: string;
  isPro?: boolean;
  source?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  unitInfo?: string;
  userGrants?: string;
}

export async function submitIntelligenceFeedback(data: IntelligenceFeedbackData) {
  const { 
    guestMobile, questionId, questionText, testId, reaction, 
    message, isPro, source, userId, userName, userEmail, unitInfo, userGrants 
  } = data;

  try {
    const feedbackId = randomUUID();
    
    await db.insert(intelligenceFeedback).values({
      id: feedbackId,
      questionId,
      questionText: questionText || null,
      testId: testId || null,
      reaction,
      message: message || null,
      isPro: isPro || false,
      source: source || null,
      userId: userId || null,
      userName: userName || null,
      userMobile: guestMobile || null,
      userEmail: userEmail || null,
      examType: 'mppolice',
    });

    const emojiMap = { 
      helpful: '👍 Helpful', 
      insightful: '💡 Insightful', 
      unhelpful: '👎 Unhelpful', 
      doubt: '❓ Doubt' 
    };
    const reactionLabel = emojiMap[reaction] || reaction;
    
    let studentInfo = `<b>Student:</b> ${escapeHTML(userName || guestMobile || 'Anonymous Guest')}`;
    if (userEmail) studentInfo += `\n<b>Email:</b> ${userEmail}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    
    const studentLabel = isPro ? '💎 Subscribed Pro User' : '👤 Guest Student';

    await sendTelegramNotification(
      `${isPro ? '💎' : '🧠'} <b>User Feedback Alert</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>Action:</b> ${reactionLabel}\n` +
      `<b>Source:</b> <code>${source || 'Generic Page'}</code>\n` +
      `<b>Status:</b> ${studentLabel}\n` +
      (unitInfo ? `<b>Unit:</b> <code>${escapeHTML(unitInfo)}</code>\n` : '') +
      `${studentInfo}\n` +
      `<b>Time:</b> ${timeStr} IST\n` +
      `<b>Content Ref:</b> <code>${questionId}</code>\n` +
      `<b>Content:</b> <i>"${escapeHTML(questionText).slice(0, 150)}..."</i>\n` +
      (message ? `\n<b>Message:</b> ${escapeHTML(message)}\n` : '') +
      `━━━━━━━━━━━━━━━━\n` +
      `#UserFeedback ${isPro ? '#ProUser' : ''}`
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to submit feedback', error);
    return { error: 'Failed to save feedback' };
  }
}
