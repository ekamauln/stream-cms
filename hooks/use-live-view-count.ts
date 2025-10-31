"use client";

import { useState, useEffect, useCallback } from "react";

// Global event emitter for view count updates
class ViewCountEventEmitter {
  private listeners: { [movieSlug: string]: ((newCount: number) => void)[] } = {};

  subscribe(movieSlug: string, callback: (newCount: number) => void) {
    if (!this.listeners[movieSlug]) {
      this.listeners[movieSlug] = [];
    }
    this.listeners[movieSlug].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners[movieSlug]?.indexOf(callback);
      if (index !== undefined && index > -1) {
        this.listeners[movieSlug].splice(index, 1);
      }
    };
  }

  emit(movieSlug: string, newCount: number) {
    this.listeners[movieSlug]?.forEach(callback => callback(newCount));
  }
}

const globalViewCountEmitter = new ViewCountEventEmitter();

// Function to get initial view count (checking localStorage for updated counts)
function getInitialViewCount(movieSlug: string, baseCount: number): number {
  if (typeof window === 'undefined') return baseCount;
  
  // Check if we have a stored updated count for this movie
  try {
    const storedCount = localStorage.getItem(`viewCount_${movieSlug}`);
    if (storedCount) {
      const parsedCount = parseInt(storedCount, 10);
      if (!isNaN(parsedCount) && parsedCount > baseCount) {
        return parsedCount;
      }
    }
  } catch {
    // Silently handle localStorage errors
  }
  
  return baseCount;
}

// Custom hook for managing view counts
export function useLiveViewCount(movieSlug: string, initialCount: number) {
  const [viewCount, setViewCount] = useState(() => 
    getInitialViewCount(movieSlug, initialCount)
  );
  const [isIncrementing, setIsIncrementing] = useState(false);

  const updateViewCount = useCallback((newCount: number) => {
    setIsIncrementing(true);
    setViewCount(newCount);
    
    // Store the updated count in localStorage for persistence across page navigations
    try {
      localStorage.setItem(`viewCount_${movieSlug}`, newCount.toString());
    } catch {
      // Silently handle localStorage errors
    }
    
    // Remove the incrementing state after animation
    setTimeout(() => setIsIncrementing(false), 500);
  }, [movieSlug]);

  useEffect(() => {
    // Subscribe to view count updates
    const unsubscribe = globalViewCountEmitter.subscribe(movieSlug, updateViewCount);

    // Listen for custom events from view tracking
    const handleMovieViewed = (e: CustomEvent) => {
      if (e.detail.slug === movieSlug) {
        if (e.detail.newViewCount) {
          updateViewCount(e.detail.newViewCount);
        } else {
          // Fallback: increment by 1 if no specific count provided
          setViewCount(prev => {
            const newCount = prev + 1;
            updateViewCount(newCount);
            return newCount;
          });
        }
      }
    };

    window.addEventListener('movieViewed', handleMovieViewed as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('movieViewed', handleMovieViewed as EventListener);
    };
  }, [movieSlug, updateViewCount]);

  return {
    viewCount,
    isIncrementing,
    updateViewCount: (newCount: number) => globalViewCountEmitter.emit(movieSlug, newCount)
  };
}