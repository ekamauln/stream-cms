"use client";

import { useLiveViewCount } from "@/hooks/use-live-view-count";

interface LiveViewCountProps {
  movieSlug: string;
  initialCount: number;
  className?: string;
}

export function LiveViewCount({ movieSlug, initialCount, className }: LiveViewCountProps) {
  const { viewCount, isIncrementing } = useLiveViewCount(movieSlug, initialCount);

  return (
    <span className={`${className} ${isIncrementing ? 'text-green-500 font-bold transition-all duration-300' : ''}`}>
      {viewCount.toLocaleString()} views
    </span>
  );
}