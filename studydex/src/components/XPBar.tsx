import React from 'react';

interface XPBarProps {
  currentXP: number;
  neededXP: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  neededXP,
  label = 'XP',
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, (currentXP / neededXP) * 100));

  let heightClass = 'h-2';
  if (size === 'sm') heightClass = 'h-1.5';
  if (size === 'lg') heightClass = 'h-4';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-[10px] mb-1 font-mono font-bold uppercase tracking-wide">
        <span className="text-neutral-200">{label}</span>
        <span className="text-[#CC0000] font-black">{currentXP}/{neededXP} XP</span>
      </div>
      <div className="w-full bg-neutral-900 rounded-full border-2 border-neutral-950 overflow-hidden p-[1px]">
        <div
          className={`bg-[#CC0000] rounded-full transition-all duration-700 ease-out ${heightClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
