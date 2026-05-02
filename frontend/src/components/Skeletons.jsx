import React from 'react';

// place holders/skeletons shown while the main data is still fetching
export const ThoughtSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-white/[0.06]"></div>
      <div className="space-y-2">
        <div className="h-3 bg-white/[0.06] rounded-full w-24"></div>
        <div className="h-2 bg-white/[0.04] rounded-full w-16"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-white/[0.06] rounded-full w-full"></div>
      <div className="h-3 bg-white/[0.06] rounded-full w-3/4"></div>
      <div className="h-3 bg-white/[0.04] rounded-full w-1/2"></div>
    </div>
    <div className="mt-6 flex gap-6">
      <div className="h-4 bg-white/[0.04] rounded-full w-12"></div>
      <div className="h-4 bg-white/[0.04] rounded-full w-12"></div>
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex justify-start">
      <div className="max-w-[60%] p-4 rounded-2xl bg-white/[0.06] rounded-bl-sm">
        <div className="h-3 bg-white/[0.06] rounded-full w-36 mb-2"></div>
        <div className="h-3 bg-white/[0.04] rounded-full w-24"></div>
      </div>
    </div>
    <div className="flex justify-end">
      <div className="max-w-[60%] p-4 rounded-2xl bg-primary-600/20 rounded-br-sm">
        <div className="h-3 bg-primary-500/20 rounded-full w-44 mb-2"></div>
        <div className="h-3 bg-primary-500/10 rounded-full w-28"></div>
      </div>
    </div>
    <div className="flex justify-start">
      <div className="max-w-[60%] p-4 rounded-2xl bg-white/[0.06] rounded-bl-sm">
        <div className="h-3 bg-white/[0.06] rounded-full w-52 mb-2"></div>
        <div className="h-3 bg-white/[0.04] rounded-full w-32"></div>
      </div>
    </div>
  </div>
);

export const StackSkeleton = () => (
  <div className="absolute inset-0 glass-card p-8 animate-pulse">
    <div className="h-full flex flex-col items-center justify-center space-y-6">
      <div className="w-28 h-28 rounded-full bg-white/[0.06] border border-white/[0.08]"></div>
      <div className="space-y-3 w-full max-w-[200px]">
        <div className="h-5 bg-white/[0.06] rounded-full w-3/4 mx-auto"></div>
        <div className="h-3 bg-white/[0.04] rounded-full w-1/2 mx-auto"></div>
      </div>
      <div className="space-y-2 w-full max-w-[250px]">
        <div className="h-3 bg-white/[0.04] rounded-full w-full"></div>
        <div className="h-3 bg-white/[0.04] rounded-full w-5/6 mx-auto"></div>
      </div>
    </div>
  </div>
);
