"use client";

import { useEffect, useRef } from "react";

interface UseTimedViewTrackingOptions {
  delay?: number; // Delay before tracking (ms)
  threshold?: number; // Intersection threshold (0-1)
  cooldownMinutes?: number; // Minutes to wait between counts for same user
}

export function useTimedViewTracking(
  slug: string, 
  options: UseTimedViewTrackingOptions = {}
) {
  const {
    delay = 500,
    threshold = 0.5,
    cooldownMinutes = 30 // Default: 30 minutes between counts
  } = options;
  
  const hasTracked = useRef(false);
  const isTracking = useRef(false);

  useEffect(() => {
    if (hasTracked.current || isTracking.current) {
      return;
    }

    // Check time-based cooldown
    const checkCooldown = () => {
      const lastViewKey = `lastView_${slug}`;
      const lastViewTime = localStorage.getItem(lastViewKey);
      
      if (lastViewTime) {
        const timeSinceLastView = Date.now() - parseInt(lastViewTime);
        const cooldownMs = cooldownMinutes * 60 * 1000;
        
        if (timeSinceLastView < cooldownMs) {
          console.log(`View tracking on cooldown for ${slug}. ${Math.ceil((cooldownMs - timeSinceLastView) / 1000 / 60)} minutes remaining.`);
          return false;
        }
      }
      
      return true;
    };

    if (!checkCooldown()) {
      return;
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

          // Store timestamp of this view
          const lastViewKey = `lastView_${slug}`;
          localStorage.setItem(lastViewKey, Date.now().toString());
          hasTracked.current = true;
          
          // Broadcast view event to other components
          const viewEvent = new CustomEvent('movieViewed', {
            detail: { slug, newViewCount }
          });
          window.dispatchEvent(viewEvent);
        }
      } catch (error) {
        console.error("Failed to track view:", error);
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
  }, [slug, delay, threshold, cooldownMinutes]);

  return {
    hasTracked: hasTracked.current,
    isTracking: isTracking.current
  };
}