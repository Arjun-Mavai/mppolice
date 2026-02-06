import { SyllabusData } from '@/types/syllabus';
import { unit_1 } from './units/unit_1';
import { unit_2 } from './units/unit_2';
import { unit_3 } from './units/unit_3';
import { unit_4 } from './units/unit_4';
import { unit_5 } from './units/unit_5';
import { unit_6 } from './units/unit_6';
import { unit_7 } from './units/unit_7';
import { unit_8 } from './units/unit_8';
import { unit_9 } from './units/unit_9';
import { unit_10 } from './units/unit_10';

export * from '@/types/syllabus';

export const syllabusData: SyllabusData = {
  exam_name: "राज्य सेवा (प्रारंभिक) परीक्षा",
  subject: "सामान्य अध्ययन - प्रथम प्रश्न पत्र",
  units: {
    "unit_1": unit_1,
    "unit_2": unit_2,
    "unit_3": unit_3,
    "unit_4": unit_4,
    "unit_5": unit_5,
    "unit_6": unit_6,
    "unit_7": unit_7,
    "unit_8": unit_8,
    "unit_9": unit_9,
    "unit_10": unit_10,
  }
};

// Lightweight metadata for menus/lists without loading heavy topics
// Note: This still bundles everything if imported from this file because of the imports above.
// To truly optimize, users should use `getSyllabusUnit` and NOT import `syllabusData` where possible.
export const syllabusMetadata = {
  exam_name: syllabusData.exam_name,
  subject: syllabusData.subject,
  units: Object.entries(syllabusData.units).map(([key, unit]) => ({
    id: key,
    title: unit.title,
    title_en: unit.title_en,
    unit_title: unit.unit_title
  }))
};
