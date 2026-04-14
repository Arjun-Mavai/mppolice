'use server';

import { db } from '@/db';
import { pricingConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PRICING_DEFAULTS, type PricingData } from '@/config/pricing';

/**
 * 💰 Get Pricing Data (Server Action)
 *
 * Fetches current pricing configuration from database for a specific exam.
 * Defaults to 'mppolice' for this repo.
 * Falls back to defaults if not found.
 */
export async function getPricingData(examType: 'upsc' | 'mppsc' | 'mppolice' = 'mppolice'): Promise<{ pricing: PricingData }> {
  try {
    const pricingRows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);

    if (pricingRows.length > 0) {
      const row = pricingRows[0];
      // Coerce nullable DB values to non-null using defaults
      const pricing: PricingData = {
        litePrice: row.litePrice ?? PRICING_DEFAULTS.litePrice,
        liteOriginalPrice: row.liteOriginalPrice ?? PRICING_DEFAULTS.liteOriginalPrice,
        liteValidityText: row.liteValidityText ?? PRICING_DEFAULTS.liteValidityText,
        liteMonths: row.liteMonths ?? PRICING_DEFAULTS.liteMonths,
        proPrice: row.proPrice ?? PRICING_DEFAULTS.proPrice,
        proOriginalPrice: row.proOriginalPrice ?? PRICING_DEFAULTS.proOriginalPrice,
        proValidityText: row.proValidityText ?? PRICING_DEFAULTS.proValidityText,
        proMonths: row.proMonths ?? PRICING_DEFAULTS.proMonths,
        upgradePrice: row.upgradePrice ?? PRICING_DEFAULTS.upgradePrice,
        upgradeOriginalPrice: row.upgradeOriginalPrice ?? PRICING_DEFAULTS.upgradeOriginalPrice,
        urgencyText: row.urgencyText ?? PRICING_DEFAULTS.urgencyText,
        urgencyTextHi: row.urgencyTextHi ?? PRICING_DEFAULTS.urgencyTextHi,
        studentsBought: row.studentsBought ?? PRICING_DEFAULTS.studentsBought,
      };
      return { pricing };
    }

    // If row not found, return defaults (maybe it hasn't been seeded)
    return { pricing: PRICING_DEFAULTS };
  } catch (error) {
    // Fallback to defaults on error
    return { pricing: PRICING_DEFAULTS };
  }
}
