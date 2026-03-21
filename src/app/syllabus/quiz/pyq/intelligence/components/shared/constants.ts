// PYQ Intelligence shared constants

export const UNIT_COLORS: Record<string, string> = {
  unit_1: 'bg-rose-500',
  unit_2: 'bg-orange-500',
  unit_3: 'bg-amber-400',
  unit_4: 'bg-yellow-400',
  unit_5: 'bg-lime-400',
  unit_6: 'bg-green-400',
  unit_7: 'bg-emerald-400',
  unit_8: 'bg-teal-400',
  unit_9: 'bg-cyan-400',
  unit_10: 'bg-sky-400',
  unmapped: 'bg-slate-600',
};

export const getUnitColor = (unitId: string): string => {
  return UNIT_COLORS[unitId] || 'bg-slate-500';
};

export const formatUnitTitle = (unitId: string): string => {
  return unitId.replace(/unit_/i, 'Unit ').replace(/_/g, ' ');
};
