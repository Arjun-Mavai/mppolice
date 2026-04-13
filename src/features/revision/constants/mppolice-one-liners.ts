export const MPPOLICE_ONELINER_SUBJECTS = [
  'General Knowledge',
  'General Science',
  'Logical Reasoning',
  'Quantitative Aptitude',
] as const;

export type MppoliceOnelinerSubject = (typeof MPPOLICE_ONELINER_SUBJECTS)[number];
