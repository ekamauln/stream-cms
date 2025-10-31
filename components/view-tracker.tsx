"use client";

import { useViewTracking } from "@/hooks/use-view-tracking";

interface ViewTrackerProps {
  movieSlug: string;
  delay?: number;
  threshold?: number;
  sessionBased?: boolean;
}

export function ViewTracker({ 
  movieSlug, 
  delay = 500, 
  threshold = 0.5,
  sessionBased = true 
}: ViewTrackerProps) {
  // Use the custom hook for view tracking
  useViewTracking(movieSlug, {
    delay,
    threshold,
    sessionBased
  });

  // This component renders nothing - it's just for tracking
  return null;
}