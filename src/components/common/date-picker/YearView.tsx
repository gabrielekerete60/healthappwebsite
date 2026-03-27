import React from 'react';
import { getYear } from 'date-fns';

interface YearViewProps {
  currentMonth: Date;
  years: number[];
  handleYearSelect: (year: number) => void;
}

export function YearView({ currentMonth, years, handleYearSelect }: YearViewProps) {
  return (
    <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-1 relative z-10 scroll-smooth">
      {years.map((y) => (
        <button
          type="button"
          key={y}
          onClick={() => handleYearSelect(y)}
          className={`py-8 rounded-[24px] text-[13px] font-black tracking-tighter transition-all duration-300 border ${
            getYear(currentMonth) === y 
              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 border-blue-500 scale-105' 
              : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10'
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  );
}
