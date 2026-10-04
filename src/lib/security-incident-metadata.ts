/**
 * 🛡️ Security Incident Metadata Helper
 *
 * Manages security incidents stored inside `mppsc_users.metadata`:
 * - Logs incidents (client_vault_missing, unauthorized_device, etc.)
 * - Allows users to submit their honest justification (e.g. cache cleared, phone changed)
 * - Allows admins to audit & resolve incidents
 */

export interface SecurityIncident {
  id: string;
  type: string; // 'client_vault_missing' | 'unauthorized_device' | 'device_mismatch' | 'token_hijack_attempt'
  timestamp: string;
  ip: string;
  location?: string | null;
  userAgent?: string | null;
  status: 'pending_clarification' | 'justified' | 'resolved';
  userJustification?: string | null;
  justifiedAt?: string | null;
  resolvedAt?: string | null;
}

export function parseMetadata(metadata: unknown): Record<string, any> {
  if (!metadata) return {};
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  if (typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata)) {
    return { ...metadata };
  }
  return {};
}

export function getSecurityIncidents(metadata: unknown): SecurityIncident[] {
  const meta = parseMetadata(metadata);
  if (Array.isArray(meta.securityIncidents)) {
    return meta.securityIncidents;
  }
  return [];
}

export function getPendingSecurityIncident(metadata: unknown): SecurityIncident | null {
  const incidents = getSecurityIncidents(metadata);
  return incidents.find((inc) => inc.status === 'pending_clarification') || null;
}

/**
 * Appends a new incident to user metadata (with 10-minute deduplication)
 */
export function recordSecurityIncident(
  metadata: unknown,
  incidentData: {
    type: string;
    ip: string;
    location?: string | null;
    userAgent?: string | null;
  }
): Record<string, any> {
  const base = parseMetadata(metadata);
  const incidents: SecurityIncident[] = Array.isArray(base.securityIncidents)
    ? [...base.securityIncidents]
    : [];

  const now = Date.now();
  // Check if a similar incident occurred within the last 10 minutes
  const isDuplicate = incidents.some((inc) => {
    const timeDiff = now - new Date(inc.timestamp).getTime();
    return timeDiff < 10 * 60 * 1000 && inc.type === incidentData.type;
  });

  if (!isDuplicate) {
    const newIncident: SecurityIncident = {
      id: `inc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      type: incidentData.type,
      timestamp: new Date().toISOString(),
      ip: incidentData.ip,
      location: incidentData.location || null,
      userAgent: incidentData.userAgent || null,
      status: 'pending_clarification',
      userJustification: null,
      justifiedAt: null,
      resolvedAt: null,
    };

    // Keep up to 20 most recent incidents
    incidents.unshift(newIncident);
    if (incidents.length > 20) {
      incidents.length = 20;
    }
  }

  base.securityIncidents = incidents;
  return base;
}

/**
 * Submits user justification for pending incident(s)
 */
export function submitSecurityJustification(
  metadata: unknown,
  incidentId: string | undefined,
  justification: string
): Record<string, any> {
  const base = parseMetadata(metadata);
  const incidents: SecurityIncident[] = Array.isArray(base.securityIncidents)
    ? [...base.securityIncidents]
    : [];

  let updated = false;
  const nowIso = new Date().toISOString();

  for (const inc of incidents) {
    if ((!incidentId || inc.id === incidentId) && inc.status === 'pending_clarification') {
      inc.status = 'justified';
      inc.userJustification = justification.trim();
      inc.justifiedAt = nowIso;
      updated = true;
    }
  }

  if (!updated && incidents.length > 0 && incidents[0]) {
    incidents[0].status = 'justified';
    incidents[0].userJustification = justification.trim();
    incidents[0].justifiedAt = nowIso;
  }

  base.securityIncidents = incidents;
  return base;
}

/**
 * Marks incident(s) as resolved by admin
 */
export function resolveSecurityIncidents(
  metadata: unknown,
  incidentId?: string
): Record<string, any> {
  const base = parseMetadata(metadata);
  const incidents: SecurityIncident[] = Array.isArray(base.securityIncidents)
    ? [...base.securityIncidents]
    : [];

  const nowIso = new Date().toISOString();

  for (const inc of incidents) {
    if (!incidentId || inc.id === incidentId) {
      inc.status = 'resolved';
      inc.resolvedAt = nowIso;
    }
  }

  base.securityIncidents = incidents;
  return base;
}
