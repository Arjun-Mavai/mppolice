"use server";

import { db } from "@/db";
import { syllabusTopics } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function getSyllabusTopics() {
  try {
    const topics = await db.query.syllabusTopics.findMany({
      orderBy: [asc(syllabusTopics.order)],
    });

    // Group by Unit
    const grouped: Record<string, typeof topics> = {};
    
    // Sort logic handled by DB order, but if we need unit sorting we can do it client side or here.
    // Let's return the raw list or grouped list. Grouping is easier for UI.
    
    topics.forEach(topic => {
      if (!grouped[topic.unitId]) {
        grouped[topic.unitId] = [];
      }
      grouped[topic.unitId].push(topic);
    });

    return { success: true, data: grouped };

  } catch (error) {
    console.error("Error fetching syllabus topics:", error);
    return { success: false, error: "Failed to fetch topics" };
  }
}
