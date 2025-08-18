import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to monitor tab switching and focus violations during exams
 * @param onLimitReached - Callback when violation limit is reached
 * @param limit - Maximum number of violations allowed (default: 5)
 * @param onViolation - Callback on each violation with current count
 */
export function useTabMonitor(
  onLimitReached: () => void,
  limit = 5,
  onViolation?: (count: number) => void
) {
  const counterRef = useRef(0);
  const lastViolationTime = useRef(0);
  const lastFocusTime = useRef(Date.now());
  const isPageVisible = useRef(true);

  const handleViolation = useCallback(() => {
    const now = Date.now();
    // Prevent duplicate violations within 500ms
    if (now - lastViolationTime.current < 500) {
      return;
    }
    lastViolationTime.current = now;

    counterRef.current += 1;

    if (onViolation) {
      onViolation(counterRef.current);
    }

    if (counterRef.current >= limit) {
      onLimitReached();
    }
  }, [onLimitReached, limit, onViolation]);

  // Check for violations every 10 seconds
  const checkViolation = useCallback(() => {
    const now = Date.now();
    
    // Check if page is hidden or if window has been blurred for more than 10 seconds
    if (document.hidden || !isPageVisible.current) {
      handleViolation();
    }
    
    // Additional check: if last focus was more than 10 seconds ago
    if (now - lastFocusTime.current > 10000) {
      handleViolation();
      lastFocusTime.current = now; // Reset to prevent continuous violations
    }
  }, [handleViolation]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
      if (document.hidden) {
        handleViolation();
      } else {
        lastFocusTime.current = Date.now();
      }
    };

    const handleFocus = () => {
      lastFocusTime.current = Date.now();
      isPageVisible.current = true;
    };

    const handleBlur = () => {
      isPageVisible.current = false;
      handleViolation();
    };

    // Listen for window blur (switching tabs/apps)
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    // Listen for visibility change (tab switching)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up periodic violation check every 10 seconds
    const violationCheckInterval = setInterval(checkViolation, 10000);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(violationCheckInterval);
    };
  }, [handleViolation, checkViolation]);

  // Return current violation count for display purposes
  return {
    violationCount: counterRef.current,
    resetViolations: () => {
      counterRef.current = 0;
      lastViolationTime.current = 0;
      lastFocusTime.current = Date.now();
      isPageVisible.current = true;
    }
  };
}
