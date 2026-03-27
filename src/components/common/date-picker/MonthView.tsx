import React from 'react';
import { getMonth } from 'date-fns';

interface MonthViewProps {
  currentMonth: Date;
  months: string[];
  handleMonthSelect: (monthIdx: number) => void;
}

export function MonthView({ currentMonth, months, handleMonthSelect }: MonthViewProps) {
  return (
    <div className="grid grid-cols-3 gap-4 relative z-10">
      {months.map((m, i) => (
        <button
          type="button"
          key={m}
          onClick={() => handleMonthSelect(i)}
          className={`py-8 rounded-[32px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
            getMonth(currentMonth) === i 
              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 border-blue-500 scale-105' 
              : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
