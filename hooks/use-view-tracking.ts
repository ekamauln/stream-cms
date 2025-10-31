"use client";

import { useEffect, useRef } from "react";

interface UseViewTrackingOptions {
  delay?: number; // Delay before tracking (ms)
  threshold?: number; // Intersection threshold (0-1)
  sessionBased?: boolean; // Whether to use session storage
}

export function useViewTracking(
  slug: string, 
  options: UseViewTrackingOptions = {}
) {
  const {
    delay = 500,
    threshold = 0.5,
    sessionBased = true
  } = options;
  
  const hasTracked = useRef(false);
  const isTracking = useRef(false);

  useEffect(() => {
    if (hasTracked.current || isTracking.current) {
      return;
    }

    // Check session storage if enabled
    if (sessionBased) {
      const viewedKey = `viewed_${slug}`;
      const hasViewed = sessionStorage.getItem(viewedKey);
      
      if (hasViewed) {
        return;
      }
    }

    const trackView = async () => {
      if (isTracking.current) return;
      isTracking.current = true;

      try {
        const response = await fetch(`/api/movies/${slug}/views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          let newViewCount = null;
          
          try {
            const responseData = await response.json();
            newViewCount = responseData.viewCount;
          } catch {
            // Could not parse response
          }

          if (sessionBased) {
            sessionStorage.setItem(`viewed_${slug}`, "true");
            hasTracked.current = true;
          }
          
          // Broadcast view event to other components
          const viewEvent = new CustomEvent('movieViewed', {
            detail: { slug, newViewCount }
          });
          window.dispatchEvent(viewEvent);
        }
      } catch {
        // Silently handle tracking errors
      } finally {
        isTracking.current = false;
      }
    };

    const startTracking = () => {
      const videoElement = document.querySelector('video, iframe');
      const contentElement = videoElement || document.querySelector('main, .container');
      
      if (contentElement && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                trackView();
                observer.disconnect();
              }
            });
          },
          {
            threshold,
            rootMargin: '0px'
          }
        );
        
        observer.observe(contentElement);
        
        return () => observer.disconnect();
      } else {
        // Fallback for older browsers or when no content element found
        const timer = setTimeout(trackView, 2000);
        return () => clearTimeout(timer);
      }
    };

    const timer = setTimeout(startTracking, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [slug, delay, threshold, sessionBased]);

  return {
    hasTracked: hasTracked.current,
    isTracking: isTracking.current
  };
}