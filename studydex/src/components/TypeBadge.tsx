import React from 'react';
import { TYPE_COLORS, TYPE_TRANSLATIONS } from '../constants/subjects';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const normType = type.toLowerCase();
  const color = TYPE_COLORS[normType] || '#777777';
  const label = TYPE_TRANSLATIONS[normType] || type;

  return (
    <span
      className={`inline-block font-mono font-extrabold rounded text-white tracking-wider uppercase text-center border border-neutral-950 shadow-[1px_1px_0px_#1A1A1A] ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'
      }`}
      style={{
        backgroundColor: color,
      }}
    >
      {label}
    </span>
  );
};
