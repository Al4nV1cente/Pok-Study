import React from 'react';

interface PokeballLoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PokeballLoader: React.FC<PokeballLoaderProps> = ({
  label = 'Carregando...',
  size = 'md',
}) => {
  let sizePx = 'w-16 h-16';
  if (size === 'sm') sizePx = 'w-8 h-8';
  if (size === 'lg') sizePx = 'w-24 h-24';

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className={`relative ${sizePx} animate-spin duration-1000`}>
        {/* Upper red half */}
        <div className="absolute top-0 left-0 right-0 bottom-1/2 bg-red-600 rounded-t-full border-t border-r border-l border-neutral-900 border-2" />
        {/* Lower white half */}
        <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-white rounded-b-full border-b border-r border-l border-neutral-900 border-2" />
        {/* Horizontal center black line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-900 -translate-y-1/2" />
        {/* Center button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-neutral-900 rounded-full flex items-center justify-center shadow-md">
          <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
        </div>
      </div>
      {label && (
        <p className="text-neutral-600 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
