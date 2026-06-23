import { NextResponse, after } from 'next/server';
import { sendTelemetryEvent, TelemetryEvent } from '@/lib/telegram-events';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

function normalizeOrigin(origin: string | null | undefined): string | null {
  if (!origin) return null;
  try {
    return new URL(origin).origin.toLowerCase();
  } catch {
    return null;
  }
}

const ALLOWED_ORIGINS = new Set(
  [process.env.NEXT_PUBLIC_BASE_URL, 'http://localhost:3000', 'https://mppolice.zenscroll.app']
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin))
);

export async function POST(req: Request) {
  try {
    const headerList = await headers();
    const requestOrigin = normalizeOrigin(headerList.get('origin'));
    const secFetchSite = headerList.get('sec-fetch-site');
    const host = headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') ?? 'https';
    const hostOrigin = normalizeOrigin(host ? `${proto}://${host}` : null);

    const isSameOrigin = requestOrigin && hostOrigin && requestOrigin === hostOrigin;
    const isSameSite = secFetchSite === 'same-origin' || secFetchSite === 'same-site';
    const isAllowedOrigin = requestOrigin ? ALLOWED_ORIGINS.has(requestOrigin) : false;

    if (!isSameOrigin && !isSameSite && !isAllowedOrigin && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body: TelemetryEvent;
    try {
      body = (await req.json()) as TelemetryEvent;
    } catch {
      return NextResponse.json({ error: 'Invalid or missing JSON payload' }, { status: 400 });
    }
    
    if (!body || !body.type || !body.path) {
      return NextResponse.json({ error: 'Invalid telemetry payload' }, { status: 400 });
    }

    const sanitize = <T extends string | null | undefined>(str: T, max = 500): T => 
      typeof str === 'string' ? str.substring(0, max) as T : str;

    const isCloudflare = !!headerList.get('cf-connecting-ip');
    const ip = headerList.get('cf-connecting-ip') || headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'Unknown IP';
    
    const rawCity = isCloudflare ? headerList.get('cf-ipcity') : (headerList.get('x-vercel-ip-city') || headerList.get('cf-ipcity'));
    let city: string | null = rawCity;
    if (rawCity) {
      try { city = decodeURIComponent(rawCity); } catch { city = rawCity; }
    }
    
    const region = isCloudflare ? null : headerList.get('x-vercel-ip-country-region');
    const country = isCloudflare ? headerList.get('cf-ipcountry') : (headerList.get('x-vercel-ip-country') || headerList.get('cf-ipcountry'));
    
    const locationParts: string[] = [];
    if (city) locationParts.push(city);
    if (region) locationParts.push(region);
    if (country) locationParts.push(country);
    const location = locationParts.length > 0 ? locationParts.join(', ') : undefined;

    const validatedEvent: TelemetryEvent = {
      ...body,
      path: body.path.substring(0, 255),
      previousPath: sanitize(body.previousPath, 255),
      referrer: sanitize(body.referrer, 500),
      userAgent: sanitize(body.userAgent, 500),
      actionDetails: sanitize(body.actionDetails, 1000),
      guestName: sanitize(body.guestName, 100),
      ip,
      location,
    };

    after(() => {
      sendTelemetryEvent(validatedEvent).catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Telemetry API] Background telemetry dispatch failed:', err);
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error('Failed to process incoming telemetry payload', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS(req: Request) {
  const requestOrigin = normalizeOrigin(req.headers.get('origin'));
  if (!requestOrigin) {
    return new NextResponse(null, { status: 403 });
  }

  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const hostOrigin = normalizeOrigin(host ? `${proto}://${host}` : null);

  const isTrusted = ALLOWED_ORIGINS.has(requestOrigin) || (hostOrigin && requestOrigin === hostOrigin);

  if (!isTrusted) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
