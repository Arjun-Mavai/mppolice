import { findTopicById } from '@/data/mppoliceSyllabus';
import type { UiBucket } from '@/lib/mppolice/syllabus-types';

/** Matches student "Chapter tests" pill filters (app quiz hub tab 3) */
export type ChapterCategoryId = 'all' | 'science' | 'gk' | 'reasoning' | 'quant' | 'mp_gk';

export const CHAPTER_CATEGORY_PILLS: {
  id: ChapterCategoryId;
  labelEn: string;
  labelHi: string;
}[] = [
  { id: 'all', labelEn: 'All', labelHi: 'सभी' },
  { id: 'science', labelEn: 'Science', labelHi: 'विज्ञान' },
  { id: 'gk', labelEn: 'General Knowledge', labelHi: 'सामान्य ज्ञान' },
  { id: 'reasoning', labelEn: 'Logical Reasoning', labelHi: 'तार्किक तर्क' },
  { id: 'quant', labelEn: 'Quantitative Aptitude', labelHi: 'गणित / मानसिक' },
  { id: 'mp_gk', labelEn: 'MP General Knowledge', labelHi: 'MP सामान्य ज्ञान' },
];

const MP_TITLE_HINT =
  /(madhya\s*pradesh|m\.\s*p\.|mp\s+police|मध्य\s*प्रदेश|म\.\s*प्र\.|भोपाल|इंदौर|ग्वालियर|जबलपुर|उज्जैन|सागर|रीवा|छिंदवाड़ा|मध्यप्रदेश)/i;

function textLooksMpGk(title: string, titleEn?: string | null): boolean {
  const t = `${title} ${titleEn || ''}`;
  return MP_TITLE_HINT.test(t);
}

/** Map syllabus picker bucket → chapter tab (excluding mp split). */
function bucketToBaseCategory(bucket: UiBucket | undefined): ChapterCategoryId | null {
  if (!bucket || bucket === 'all') return null;
  if (bucket === 'general_science') return 'science';
  if (bucket === 'logical_reasoning') return 'reasoning';
  if (bucket === 'quantitative_aptitude') return 'quant';
  if (bucket === 'general_knowledge') return 'gk';
  return null;
}

/**
 * Resolves which chapter pill(s) a DB syllabus topic belongs to.
 * - `all` always includes every topic.
 * - Unknown IDs still appear under All; optional title heuristics fill other tabs.
 */
export function resolveChapterCategory(topic: {
  id: string;
  title: string;
  titleEn?: string | null;
}): ChapterCategoryId[] {
  const picker = findTopicById(topic.id);
  const fromPicker = picker?.uiBucket ? bucketToBaseCategory(picker.uiBucket) : null;
  const mp = textLooksMpGk(topic.title, topic.titleEn);

  if (fromPicker === 'gk') {
    if (mp) return ['all', 'mp_gk'];
    return ['all', 'gk'];
  }

  if (fromPicker) {
    return ['all', fromPicker];
  }

  // Heuristic fallback when syllabus row id ≠ picker id (legacy rows)
  const t = `${topic.title} ${topic.titleEn || ''}`.toLowerCase();
  if (mp) return ['all', 'mp_gk'];
  if (/(physics|chemistry|biology|विज्ञान|रसायन|जीव|भौतिक)/i.test(t)) return ['all', 'science'];
  if (/(reasoning|तर्क|blood relation|coding|decoding|analogy|series|दिशा)/i.test(t))
    return ['all', 'reasoning'];
  if (/(percent|profit|loss|interest|ratio|equation|संख्या|बीजगणित|क्षेत्रफल|समय)/i.test(t))
    return ['all', 'quant'];

  return ['all'];
}

export function topicMatchesChapterFilter(
  topic: { id: string; title: string; titleEn?: string | null },
  filter: ChapterCategoryId
): boolean {
  if (filter === 'all') return true;
  return resolveChapterCategory(topic).includes(filter);
}
