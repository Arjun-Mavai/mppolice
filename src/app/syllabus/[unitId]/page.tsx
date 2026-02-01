import React from 'react';
import { notFound } from 'next/navigation';
import { syllabusData } from '@/data/syllabusData';
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
  let dbTopics = [];
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
      // We assume if DB has data, it has the unit titles stored somewhere or we default
      // Ideally we should have a 'syllabus_units' table too, but for now we might still use static for titles
      const staticUnit = syllabusData.units[unitId] || { title: "Unit " + unitId, title_en: "Unit " + unitId };
      unitTitle = staticUnit.title || "Unit";
      unitTitleEn = staticUnit.title_en || staticUnit.title || "Unit";

      // Process DB Topics
      finalTopics = dbTopics.map(t => {
           const c = t.content as any;
           return {
               id: t.id,
               unitId: t.unitId,
               front: t.title, // or c.front
               back: c?.back || "",
               details: c?.details,
               mnemonic: c?.mnemonic,
               pro_tip: c?.pro_tip,
               impact_emoji: c?.impact_emoji,
               important_facts: c?.important_facts,
               isFree: t.isFree ?? false
           };
      });

      // Process English (if exists in DB, otherwise check contentEn)
      finalTopicsEn = dbTopics.map(t => {
           const c = (t.contentEn as any) || (t.content as any); // Fallback to Hindi content if EN missing
           return {
               id: t.id,
               unitId: t.unitId,
               front: t.titleEn || t.title,
               back: c?.back || "",
               details: c?.details,
               mnemonic: c?.mnemonic,
               pro_tip: c?.pro_tip,
               impact_emoji: c?.impact_emoji,
               important_facts: c?.important_facts,
               isFree: t.isFree ?? false
           };
      });

  } else {
      // Fallback: Use Static Data from syllabusData.ts
      const unit = syllabusData.units[unitId];

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
