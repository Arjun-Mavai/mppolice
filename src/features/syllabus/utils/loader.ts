import { UnitData } from '@/types/syllabus';

export async function getSyllabusUnit(unitId: string): Promise<UnitData | null> {
  try {
    switch (unitId) {
      case 'unit_1':
        return (await import('@/data/units/unit_1')).unit_1;
      case 'unit_2':
        return (await import('@/data/units/unit_2')).unit_2;
      case 'unit_3':
        return (await import('@/data/units/unit_3')).unit_3;
      case 'unit_4':
        return (await import('@/data/units/unit_4')).unit_4;
      case 'unit_5':
        return (await import('@/data/units/unit_5')).unit_5;
      case 'unit_6':
        return (await import('@/data/units/unit_6')).unit_6;
      case 'unit_7':
        return (await import('@/data/units/unit_7')).unit_7;
      case 'unit_8':
        return (await import('@/data/units/unit_8')).unit_8;
      case 'unit_9':
        return (await import('@/data/units/unit_9')).unit_9;
      case 'unit_10':
        return (await import('@/data/units/unit_10')).unit_10;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error loading unit ${unitId}:`, error);
    return null;
  }
}
