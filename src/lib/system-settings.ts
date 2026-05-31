import { db } from '@/db';
import { systemSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TELEMETRY_KEY = 'telemetry_enabled';

// Read state from DB
export async function getTelemetryEnabled(): Promise<boolean> {
  try {
    const row = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, TELEMETRY_KEY))
      .limit(1);

    if (row.length === 0) return false; // Default is disabled
    return row[0].value === 'true';
  } catch (error) {
    return false; // Fail-closed on error
  }
}

// Update state in DB
export async function setTelemetryEnabled(enabled: boolean): Promise<void> {
  const valueStr = enabled ? 'true' : 'false';
  await db.insert(systemSettings)
    .values({
      key: TELEMETRY_KEY,
      value: valueStr,
      description: 'Toggles Telegram event logging',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: { value: valueStr, updatedAt: new Date() },
    });
}
