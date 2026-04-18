import React from 'react';

export const ThoughtSkeleton = () => (
  <div className="glass-card p-6 mb-4 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
    </div>
    <div className="mt-6 flex justify-between items-center">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
    </div>
  </div>
);

export const StackSkeleton = () => (
  <div className="w-full max-w-sm mx-auto aspect-[3/4] glass-card animate-pulse relative overflow-hidden">
    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      <div className="flex justify-between mt-8">
        <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="flex flex-col h-full animate-pulse">
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
    </div>
    <div className="flex-1 p-4 space-y-4 overflow-hidden">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-3/4"></div>
        </div>
      ))}
    </div>
    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    </div>
  </div>
);
