import React from 'react';

interface RarityBadgeProps {
  rarity: string;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity }) => {
  const normalized = rarity.toUpperCase();
  
  let bgColors = 'bg-gray-400 text-white';
  let label = 'COMUM';

  switch (normalized) {
    case 'ÉPICO':
    case 'EPICO':
      bgColors = 'bg-amber-400 text-slate-900 border-amber-500 font-bold';
      label = '★ ÉPICO';
      break;
    case 'RARO':
      bgColors = 'bg-blue-500 text-white border-blue-600 font-semibold';
      label = '✦ RARO';
      break;
    case 'INCOMUM':
      bgColors = 'bg-emerald-500 text-white border-emerald-600 font-medium';
      label = '◆ INCOMUM';
      break;
    default:
      bgColors = 'bg-neutral-400 text-neutral-900 border-neutral-500 font-normal';
      label = 'COMUM';
  }

  return (
    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border-2 border-neutral-950 shadow-[1px_1px_0px_#1A1A1A] ${bgColors}`}>
      {label}
    </span>
  );
};
