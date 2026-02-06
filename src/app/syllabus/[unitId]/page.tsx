import React from 'react';
import { notFound } from 'next/navigation';
// import { syllabusData } from '@/data/syllabusData'; // Removed to prevent full bundle load
import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import UnitContent, { TopicData } from './UnitContent';

type Props = {
  params: Promise<{ unitId: string }>
}

export default async function UnitPage({ params }: Props) {
  const { unitId } = await params;

  // 1. Fetch from Database first
  let dbTopics: typeof syllabusTopics.$inferSelect[] = [];
  try {
      dbTopics = await db.query.syllabusTopics.findMany({
          where: eq(syllabusTopics.unitId, unitId),
          orderBy: [asc(syllabusTopics.order)]
      });
  } catch (error) {
      console.error("Failed to fetch syllabus topics from DB:", error);
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
        const { getSyllabusUnit } = await import('@/lib/syllabus-loader');
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
      finalTopics = dbTopics.map(t => {
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
               isFree: t.isFree ?? false
           };
      });

      // Process English (if exists in DB, otherwise check contentEn)
      finalTopicsEn = dbTopics.map(t => {
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
               isFree: t.isFree ?? false
           };
      });

  } else {
      // Fallback: Use Static Data via Dynamic Loader (Code Splitting)
      const { getSyllabusUnit } = await import('@/lib/syllabus-loader');
      const unit = await getSyllabusUnit(unitId);

      if (!unit) {
         notFound();
      }

      unitTitle = unit.title || "";
      unitTitleEn = unit.title_en || unit.title || "";

      // Smart Mapping: Unit 1 topics 1-10 are FREE
      const isUnit1 = unitId === 'unit_1';

      finalTopics = (unit.topics || []).map((t, idx) => ({
          ...t,
          unitId,
          // Unit 1 First 10 are Free
          isFree: isUnit1 ? idx < 10 : false 
      }));

      finalTopicsEn = (unit.topics_en || unit.topics || []).map((t, idx) => ({
          ...t,
          unitId,
          isFree: isUnit1 ? idx < 10 : false
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
