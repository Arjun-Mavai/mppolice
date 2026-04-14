/** Official MP Police Constable Paper I section weights */
export type MppoliceSection =
  | 'gk_reasoning'
  | 'mental_ability'
  | 'science_arithmetic';

/** 4-tab UI (reference UI); maps to official sections via mapping helpers */
export type UiBucket =
  | 'all'
  | 'general_knowledge'
  | 'general_science'
  | 'logical_reasoning'
  | 'quantitative_aptitude'
  | 'mp_general_knowledge';

export const UI_BUCKET_KEYS: Exclude<UiBucket, 'all'>[] = [
  'general_knowledge',
  'general_science',
  'logical_reasoning',
  'quantitative_aptitude',
  'mp_general_knowledge',
];

export interface MppolicePickerTopic {
  id: string;
  front: string;
  frontEn?: string;
  sectionId: string;
  mppoliceSection: MppoliceSection;
  uiBucket: Exclude<UiBucket, 'all'>;
  topicPath: string;
}
