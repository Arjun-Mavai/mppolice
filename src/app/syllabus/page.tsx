import { Suspense } from "react";
import { getSyllabusTopics } from "@/actions/getSyllabusTopics";
import { syllabusData as staticSyllabusData } from "@/data/syllabusData";
import { SyllabusClient } from "@/features/syllabus/components/SyllabusClient";
import { SyllabusData } from "@/types/syllabus";

// 7-Day Cached Data Fetching
async function getSyllabusData(): Promise<SyllabusData> {
  console.log("DEBUG: getSyllabusData started");
  
  try {
      // 1. Fetch Dynamic Topics from DB (Cached)
      const { data: dynamicTopics } = await getSyllabusTopics();
      console.log("DEBUG: dynamicTopics fetched", dynamicTopics ? "Found" : "Null");
  
      // 2. Merge with Static Metadata (Titles, Images)
      // We clone the static data to avoid mutating the original import
      const mergedUnits = { ...staticSyllabusData.units };

      if (dynamicTopics) {
          Object.keys(mergedUnits).forEach(unitKey => {
              const unitTopics = dynamicTopics[unitKey];
              if (unitTopics && unitTopics.length > 0) {
                 // Logic to merge DB topics would go here.
                 // Currently just logging and using static data as per previous logic.
                 // To execute dynamic merge:
                 /*
                 const mappedTopics = unitTopics.map(t => ({
                    id: parseInt(t.id) || 0,
                    front: t.title,
                    back: "",
                    order: t.order
                 }));
                 // mergedUnits[unitKey].topics = mappedTopics as any;
                 */
              }
          });
      }

      return staticSyllabusData;

  } catch (e) {
      console.error("DEBUG: getSyllabusData Failed", e);
      return staticSyllabusData;
  }
}

export default async function SyllabusPage() {
    console.log("DEBUG: SyllabusPage Rendering");
    const syllabusData = await getSyllabusData();

    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
            <SyllabusClient syllabusData={syllabusData} />
        </Suspense>
    )
}
