import React from 'react';
import { notFound } from 'next/navigation';
// import { syllabusData } from '@/data/syllabusData'; // Removed to prevent full bundle load
import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import UnitContent, { TopicData } from './UnitContent';
import { ACCESS_CONFIG } from '@/features/syllabus/utils/locks';
import { logger } from "@/lib/logger";

type Props = {
  params: Promise<{ unitId: string }>
}

export default async function UnitPage({ params }: Props) {
  const { unitId } = await params;

  // 1. Fetch from Database first (Cached)
  let dbTopics: typeof syllabusTopics.$inferSelect[] = [];
  try {
      const { getSyllabusTopics } = await import('@/features/syllabus/actions/get-syllabus');
      dbTopics = await getSyllabusTopics(unitId);
  } catch (error) {
      logger.error("Failed to fetch syllabus topics from DB:", error);
      // Fallback to empty, will use static data
  }

  // 2. Fallback to Static Data if DB is empty
  let finalTopics: TopicData[] = [];
  let finalTopicsEn: TopicData[] = [];
  let unitTitle = "";
  let unitTitleEn = "";

  if (dbTopics.length > 0) {
      // Use DB Data
      // Fetch dynamic unit data just for title metadata if needed
      // Ideally we should have titles in DB too.
      // We use syllabusmetadata here to avoid loading full heavy content if possible, 
      // but current structure might not allow easy access without import.
      // For now, let's just use hardcoded Fallback or minimal info to avoid heavy bundle.
      // Optimally, we fetch metadata from DB or a lightweight config.
      
      try {
        const { getSyllabusUnit } = await import('@/features/syllabus/utils/loader');
        const staticUnit = await getSyllabusUnit(unitId);
        
        if (staticUnit) {
            unitTitle = staticUnit.title || "Unit";
            unitTitleEn = staticUnit.title_en || staticUnit.title || "Unit";
        } else {
             unitTitle = "Unit " + unitId;
             unitTitleEn = "Unit " + unitId;
        }
      } catch (e) {
         unitTitle = "Unit " + unitId;
         unitTitleEn = "Unit " + unitId;
      }

      // Process DB Topics
      finalTopics = dbTopics.map((t, idx) => {
           const c = t.content as any;               // Official Syllabus (Old)
           const ai = t.aiContent as any;            // Rich AI Content (New)

           return {
               id: t.id,
               unitId: t.unitId,
               front: t.title, 
               back: c?.back || ai?.content || "",   // Fallback to AI summary if back missing
               details: c?.details,
               mnemonic: ai?.mnemonic || c?.mnemonic,
               impact_emoji: ai?.impact_emoji || c?.impact_emoji,
               important_facts: ai?.points || c?.important_facts, // "Points" from AI -> "important_facts" in UI
               pyq: ai?.pyq, // New field
               isFree: (t.isFree ?? false) || (unitId === 'unit_1' && idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1)
           };
      });

      // Process English (if exists in DB, otherwise check contentEn)
      finalTopicsEn = dbTopics.map((t, idx) => {
           const c = (t.contentEn as any) || (t.content as any); 
           const ai = (t.aiContentEn as any) || (t.aiContent as any);

           return {
               id: t.id,
               unitId: t.unitId,
               front: t.titleEn || t.title,
               back: c?.back || ai?.content || "",
               details: c?.details,
               mnemonic: ai?.mnemonic || c?.mnemonic,
               impact_emoji: ai?.impact_emoji || c?.impact_emoji,
               important_facts: ai?.points || c?.important_facts,
               pyq: ai?.pyq,
               isFree: (t.isFree ?? false) || (unitId === 'unit_1' && idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1)
           };
      });

  } else {
      // Fallback: Use Static Data via Dynamic Loader (Code Splitting)
      const { getSyllabusUnit } = await import('@/features/syllabus/utils/loader');
      const unit = await getSyllabusUnit(unitId);

      if (!unit) {
         notFound();
      }

      unitTitle = unit.title || "";
      unitTitleEn = unit.title_en || unit.title || "";

      // Bhai Unit 1 ke pehle 5 topics hi free h - baaki sab premium
      const isUnit1 = unitId === 'unit_1';

      finalTopics = (unit.topics || []).map((t, idx) => ({
          ...t,
          unitId,
          // Use centralized config for free topic limit — avoid hardcoded drift
          isFree: isUnit1 ? idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1 : false 
      }));

      finalTopicsEn = (unit.topics_en || unit.topics || []).map((t, idx) => ({
          ...t,
          unitId,
          isFree: isUnit1 ? idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1 : false
      }));
  }

  return (
    <UnitContent 
        unitId={unitId}
        unitTitle={unitTitle}
        unitTitleEn={unitTitleEn}
        topics={finalTopics}
        topicsEn={finalTopicsEn}
    />
  );
}
