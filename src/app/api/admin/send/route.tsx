import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import EmailTemplate from '../../../../components/email-template';
import { cookies } from 'next/headers';
import { db } from '@/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Admin auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.userId)
    });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const to = (body as any).to || adminUser.email;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MPPSC Syllabus <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Test Email — MPPSC Syllabus',
      react: <EmailTemplate name={adminUser.name || 'Admin'} actionUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`} planName="Admin Test" />,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}