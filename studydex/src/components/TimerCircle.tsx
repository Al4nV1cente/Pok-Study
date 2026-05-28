import React from 'react';

interface TimerCircleProps {
  remainingSeconds: number;
  totalSeconds: number;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({ remainingSeconds, totalSeconds }) => {
  const percentComplete = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  
  // Circle calculations
  const radius = 90;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentComplete / 100) * circumference;

  // Format time
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* SVG Circle Track and Fill */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 180 180">
          {/* Inner grey track */}
          <circle
            strokeWidth={stroke + 2}
            stroke="#1A1A1A"
            fill="transparent"
            r={normalizedRadius}
            cx="90"
            cy="90"
          />
          {/* Active crimson track */}
          <circle
            className="text-rose-600 transition-all duration-300 ease-linear"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="90"
            cy="90"
          />
        </svg>

        {/* Center Display text */}
        <div className="flex flex-col items-center z-10">
          <span className="text-5xl font-black font-mono tracking-tighter text-neutral-950 select-none">
            {timeString}
          </span>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#CC0000] mt-2 select-none bg-red-50 border-2 border-neutral-950 px-3 py-1 rounded-xl shadow-[1px_1px_0px_#1A1A1A] font-sans">
            FOCO ATIVO
          </span>
        </div>
      </div>
    </div>
  );
};
