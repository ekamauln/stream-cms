"use client";

import { useState, useEffect } from "react";

interface UseMovieViewsOptions {
  initialViewCount: number;
  movieSlug: string;
  updateInterval?: number; // Optional polling interval in ms
}

export function useMovieViews({ 
  initialViewCount, 
  movieSlug, 
  updateInterval 
}: UseMovieViewsOptions) {
  const [viewCount, setViewCount] = useState(initialViewCount);

  useEffect(() => {
    // Check if view count was updated in session storage
    const checkSessionViews = () => {
      const viewedKey = `viewed_${movieSlug}`;
      const hasViewed = sessionStorage.getItem(viewedKey);
      
      if (hasViewed && viewCount === initialViewCount) {
        // If user has viewed this movie in current session, increment the display count
        setViewCount(prev => prev + 1);
      }
    };

    // Listen for custom view events
    const handleMovieViewed = (e: CustomEvent) => {
      if (e.detail.slug === movieSlug) {
        // Update to the exact view count from the server
        setViewCount(e.detail.newViewCount || (viewCount + 1));
      }
    };

    // Check immediately
    checkSessionViews();

    // Listen for custom movie view events
    window.addEventListener('movieViewed', handleMovieViewed as EventListener);

    // Optional: Set up polling to check for updates
    if (updateInterval) {
      const interval = setInterval(checkSessionViews, updateInterval);
      return () => clearInterval(interval);
    }

    return () => {
      window.removeEventListener('movieViewed', handleMovieViewed as EventListener);
    };
  }, [movieSlug, initialViewCount, updateInterval, viewCount]);

  return {
    viewCount,
    setViewCount
  };
}