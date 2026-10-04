import { cookies, headers } from 'next/headers';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { logger } from '@/lib/logger';
import { extractAuthToken, extractDeviceCookie } from '@/lib/auth-constants';
import { getClientIp, getClientLocation, getClientUserAgent } from '@/lib/ip';
import { sendSecurityAlertNotification } from '@/lib/security-alerts';
import { getErrorMessage } from '@/lib/errors';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH VERIFICATION — har server component me use hota h
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// React cache() wrapper — ek request me multiple baar call
// hone par bhi DB query sirf EK baar chalega (dedup magic!)
//
// Checks:
//   1. Cookie exists? → nahi to null (not logged in)
//   2. JWT valid? → nahi to null (tampered/expired token)
//   3. User exists in DB? → nahi to null
//   4. User soft-deleted? → haan to null (deactivated account)
//   5. Device binding? → mismatch to null + Telegram alert
//
// Note: Expiry check is NOT done here — it's done at login time.
// Once logged in, user stays logged in until cookie expires (30 days).
// This prevents mid-session kicks which is bad UX.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const verifyAuthWithMismatch = cache(async () => {
  const cookieStore = await cookies();
  // 🛡️ Use extractAuthToken for both new '_app_sid' and legacy 'mppolice_token' cookies
  const token = extractAuthToken(cookieStore);
  logger.debug('AUTH checkpoint 1: auth cookie lookup', {
    category: 'auth',
    metadata: {
      hasAuthCookie: Boolean(token),
      hasPrimaryCookie: Boolean(cookieStore.get('_app_sid')?.value),
      hasLegacyCookie: Boolean(cookieStore.get('mppolice_token')?.value),
    },
  });

  if (!token) {
    logger.debug('AUTH result: guest because no auth cookie was found', { category: 'auth' });
    return { user: null, _mismatch: false };
  }

  const { verifyToken } = await import('@/lib/jwt');
  const decoded: any = verifyToken(token);
  logger.debug('AUTH checkpoint 2: JWT verification', {
    category: 'auth',
    metadata: {
      valid: Boolean(decoded?.userId),
      userId: decoded?.userId || null,
      hasSessionVersion: decoded?.sessionVersion !== undefined,
      hasDeviceBinding: Boolean(decoded?.deviceId),
    },
  });

  if (!decoded || !decoded.userId) {
    logger.warn('AUTH result: guest because JWT was invalid or missing userId', {
      category: 'auth',
    });
    return { user: null, _mismatch: false };
  }

  const userId = decoded.userId;
  const tokenVersion = decoded.sessionVersion;

  try {
    // Fetch by the JWT user ID first. Applying all eligibility predicates in SQL
    // hides the real reason when legacy rows contain nullable default fields.
    const dbUsers = await db
      .select({
        id: mppscUsers.id,
        createdAt: mppscUsers.createdAt,
        email: mppscUsers.email,
        password: mppscUsers.password,
        name: mppscUsers.name,
        isSubscribed: mppscUsers.isSubscribed,
        planTier: mppscUsers.planTier,
        role: mppscUsers.role,
        adminSecret: mppscUsers.adminSecret,
        deletedAt: mppscUsers.deletedAt,
        isActive: mppscUsers.isActive,
        sessionVersion: mppscUsers.sessionVersion,
        accessExpiresAt: mppscUsers.accessExpiresAt,
        phone: mppscUsers.phone,
        category: mppscUsers.category,
        gender: mppscUsers.gender,
        previousUserId: mppscUsers.previousUserId,
        examType: mppscUsers.examType,
        metadata: mppscUsers.metadata,
      })
      .from(mppscUsers)
      .where(eq(mppscUsers.id, userId))
      .limit(1);
    
    const rawCandidate = dbUsers[0] || null;
    const candidate = rawCandidate
      ? {
          ...rawCandidate,
          metadata:
            rawCandidate.metadata && typeof rawCandidate.metadata === 'string'
              ? (() => {
                  try {
                    return JSON.parse(rawCandidate.metadata) as Record<string, unknown>;
                  } catch {
                    return {};
                  }
                })()
              : rawCandidate.metadata ?? null,
        }
      : null;
    logger.debug('AUTH checkpoint 3b: raw database user status', {
      category: 'auth',
      userId,
      metadata: {
        foundById: Boolean(candidate),
        isActive: candidate?.isActive ?? null,
        deletedAt: candidate?.deletedAt ?? null,
        examType: candidate?.examType ?? null,
      },
    });

    const rejectionReason = !candidate
      ? 'user_id_not_found'
      : candidate.deletedAt
        ? 'user_deleted'
        : candidate.isActive === false
          ? 'user_inactive'
          : candidate.examType !== 'mppolice' && candidate.examType !== 'all'
            ? 'exam_type_mismatch'
            : null;
    const user = rejectionReason ? null : candidate;
    logger.debug('AUTH checkpoint 3: database user lookup', {
      category: 'auth',
      userId,
      metadata: {
        matchedUser: Boolean(user),
        queryFilter: 'active + not deleted + mppolice/all',
        rejectionReason,
      },
    });

    if (user) {
      const dbVersion = user.sessionVersion || 1;
      const tokVersion = tokenVersion || 1;
      logger.debug('AUTH checkpoint 4: session version check', {
        category: 'auth',
        userId,
        metadata: { dbVersion, tokenVersion: tokVersion, matches: dbVersion === tokVersion },
      });
      
      if (dbVersion !== tokVersion) {
        logger.warn('AUTH result: multi-device session mismatch', { category: 'auth', userId });
        return { user: null, _mismatch: true };
      }

      // 🛡️ Anti-Cookie-Theft: Device Binding Check
      // - If decoded.deviceId is present, it MUST match the browser's device cookie '_app_cid' (or legacy 'mppolice_did').
      // - If decoded.deviceId is absent, this is an existing legacy user session → ALLOW with zero disruption!
      if (decoded.deviceId) {
        const clientDeviceId = extractDeviceCookie(cookieStore);
        logger.debug('AUTH checkpoint 5: device binding check', {
          category: 'auth',
          userId,
          metadata: {
            tokenHasDeviceId: true,
            clientHasDeviceId: Boolean(clientDeviceId),
            matches: clientDeviceId === decoded.deviceId,
          },
        });
        if (!clientDeviceId || clientDeviceId !== decoded.deviceId) {
          logger.warn('Device mismatch detected — copied token or unauthorized device', {
            category: 'auth',
            userId,
            tokenDeviceId: decoded.deviceId,
            clientDeviceId: clientDeviceId || 'missing',
          });

          // 🚨 Telegram Security Alert (Non-blocking)
          headers()
            .then(async (reqHeaders) => {
              const ip = getClientIp(reqHeaders);
              const location = await getClientLocation(reqHeaders, ip);
              sendSecurityAlertNotification({
                reason: 'unauthorized_device',
                token,
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
                userRole: user.role,
                tokenDeviceId: decoded.deviceId,
                clientDeviceId: clientDeviceId || null,
                ip,
                location,
                userAgent: getClientUserAgent(reqHeaders),
                triggerSource: 'server_auth',
              }).catch(() => {});
            })
            .catch(() => {});

          return { user: null, _mismatch: false, _deviceMismatch: true };
        }
      }
      logger.info('AUTH result: authenticated user accepted', {
        category: 'auth',
        userId,
        metadata: { role: user.role, planTier: user.planTier },
      });
    } else {
      logger.warn('AUTH result: guest because database user was rejected', {
        category: 'auth',
        userId,
        metadata: { rejectionReason },
      });
    }

    return { user, _mismatch: false };
  } catch (error) {
    // DB errors → null (graceful degradation, user redirected to login)
    logger.error('Database error during auth verification:', error, {
      category: 'auth',
      userId,
      metadata: { message: getErrorMessage(error) },
    });
    return { user: null, _mismatch: false };
  }
});

export const verifyAuth = cache(async () => {
  const result = await verifyAuthWithMismatch();
  return result.user;
});

export const verifyAdminAuth = cache(async () => {
  const result = await verifyAuthWithMismatch();
  if (result._mismatch || result._deviceMismatch || !result.user) return null;
  return result.user.role === 'admin' ? result.user : null;
});
