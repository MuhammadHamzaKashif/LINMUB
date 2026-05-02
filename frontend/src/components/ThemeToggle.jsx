import React from 'react';
import { Moon } from 'lucide-react';

// toggle to dark mode or back
const ThemeToggle = () => {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <Moon className="w-4 h-4 text-primary-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
      <span className="text-[10px] uppercase tracking-wider font-bold">Dark Mode</span>
    </div>
  );
};

export default ThemeToggle;
