export interface Topic {
  id: number;
  front: string;
  back: string;
  details?: string;
  mnemonic?: string;
  pro_tip?: string;
  impact_emoji?: string;
  important_facts?: string[];
  image_url?: string;
  order?: number;
}

export interface UnitData {
  title?: string; // Optional for backward compatibility
  title_en?: string;
  unit_title?: string; // New format
  exam_name?: string; // New format
  subject?: string; // New format
  unit_id?: string; // New format
  topics: Topic[];
  topics_en?: Topic[];
}

export interface SyllabusData {
  exam_name: string;
  subject: string;
  units: {
    [key: string]: UnitData;
  };
}
