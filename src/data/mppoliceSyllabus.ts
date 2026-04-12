import type { MppolicePickerTopic, MppoliceSection, UiBucket } from '@/lib/mppolice/syllabus-types';
import {
  MPPOLICE_GK_TOPICS,
  MPPOLICE_VERBAL_REASONING_TOPICS,
  MPPOLICE_NONVERBAL_REASONING_TOPICS,
  MPPOLICE_MENTAL_ABILITY_TOPICS,
  MPPOLICE_PHYSICS_TOPICS,
  MPPOLICE_CHEMISTRY_TOPICS,
  MPPOLICE_SIMPLE_ARITHMETIC_TOPICS,
} from '@/data/mppolice/topic-arrays';

export const MPPOLICE_EXAM = {
  exam: 'MP Police Constable',
  paper: 'Paper I',
  totalMarks: 100,
  totalQuestions: 100,
  durationMinutes: 120,
  negativeMarking: false,
} as const;

/** Three official syllabus sections (admin unit picker) */
export const MPPOLICE_SECTION_IDS = [
  'sec_gk_reasoning',
  'sec_mental_ability',
  'sec_science_arithmetic',
] as const;

export type MppoliceSectionId = (typeof MPPOLICE_SECTION_IDS)[number];

const SECTION_META: Record<
  MppoliceSectionId,
  { titleHi: string; titleEn: string; marks: number; mppoliceSection: MppoliceSection }
> = {
  sec_gk_reasoning: {
    titleHi: 'सामान्य ज्ञान एवं तर्कशक्ति',
    titleEn: 'General Knowledge & Reasoning',
    marks: 40,
    mppoliceSection: 'gk_reasoning',
  },
  sec_mental_ability: {
    titleHi: 'बौद्धिक क्षमता एवं मानसिक क्षमता',
    titleEn: 'Intellectual Ability & Mental Ability',
    marks: 30,
    mppoliceSection: 'mental_ability',
  },
  sec_science_arithmetic: {
    titleHi: 'विज्ञान एवं सरल अंकगणित',
    titleEn: 'Science & Simple Arithmetic',
    marks: 30,
    mppoliceSection: 'science_arithmetic',
  },
};

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}

function pushTopics(
  out: MppolicePickerTopic[],
  sectionId: MppoliceSectionId,
  labels: readonly string[],
  uiBucket: Exclude<UiBucket, 'all'>,
  prefix: string
) {
  const ms = SECTION_META[sectionId].mppoliceSection;
  for (const label of labels) {
    const id = `${sectionId}::${prefix}::${slug(label)}`;
    out.push({
      id,
      front: label,
      frontEn: label,
      sectionId,
      mppoliceSection: ms,
      uiBucket,
      topicPath: `${prefix}.${slug(label)}`,
    });
  }
}

/** All leaf topics for topic-picker (content-manager, tags) */
export function getMppoliceFlattenedTopics(): MppolicePickerTopic[] {
  const out: MppolicePickerTopic[] = [];
  pushTopics(out, 'sec_gk_reasoning', MPPOLICE_GK_TOPICS, 'general_knowledge', 'gk');
  pushTopics(
    out,
    'sec_gk_reasoning',
    MPPOLICE_VERBAL_REASONING_TOPICS,
    'logical_reasoning',
    'reasoning.verbal'
  );
  pushTopics(
    out,
    'sec_gk_reasoning',
    MPPOLICE_NONVERBAL_REASONING_TOPICS,
    'logical_reasoning',
    'reasoning.non_verbal'
  );
  pushTopics(
    out,
    'sec_mental_ability',
    MPPOLICE_MENTAL_ABILITY_TOPICS,
    'quantitative_aptitude',
    'mental'
  );
  pushTopics(
    out,
    'sec_science_arithmetic',
    MPPOLICE_PHYSICS_TOPICS,
    'general_science',
    'science.physics'
  );
  pushTopics(
    out,
    'sec_science_arithmetic',
    MPPOLICE_CHEMISTRY_TOPICS,
    'general_science',
    'science.chemistry'
  );
  pushTopics(
    out,
    'sec_science_arithmetic',
    MPPOLICE_SIMPLE_ARITHMETIC_TOPICS,
    'quantitative_aptitude',
    'arithmetic'
  );
  return out;
}

let _cachedFlat: MppolicePickerTopic[] | null = null;

export function getMppoliceTopicsForSection(sectionId: string): MppolicePickerTopic[] {
  if (!_cachedFlat) _cachedFlat = getMppoliceFlattenedTopics();
  return _cachedFlat.filter((t) => t.sectionId === sectionId);
}

export function getSectionLabel(sectionId: string, lang: 'hi' | 'en' = 'hi'): string {
  const m = SECTION_META[sectionId as MppoliceSectionId];
  if (!m) return sectionId;
  return lang === 'hi' ? m.titleHi : m.titleEn;
}

export function findTopicById(topicId: string): MppolicePickerTopic | undefined {
  if (!_cachedFlat) _cachedFlat = getMppoliceFlattenedTopics();
  return _cachedFlat.find((t) => t.id === topicId);
}

/** Tag stored on tests for PYQ hub bucket filter */
export function uiBucketToTag(bucket: Exclude<UiBucket, 'all'>): string {
  return `ui_bucket:${bucket}`;
}

export function parseUiBucketFromTags(tags: unknown): UiBucket | null {
  if (!Array.isArray(tags)) return null;
  for (const t of tags) {
    if (typeof t === 'string' && t.startsWith('ui_bucket:')) {
      const b = t.replace('ui_bucket:', '') as UiBucket;
      if (b === 'general_knowledge' || b === 'general_science' || b === 'logical_reasoning' || b === 'quantitative_aptitude')
        return b;
    }
  }
  return null;
}
