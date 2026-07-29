import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export default function useInactivityTimeout() {
  const { isAuthenticated, logout } = useAuthStore();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        logout('Your session has expired due to inactivity. Please log in again.');
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Events to track user interaction
    const activityEvents = [
      'mousemove',
      'keydown',
      'keyup',
      'keypress',
      'scroll',
      'click',
      'mousedown',
      'touchstart',
      'touchmove'
    ];

    // Initialize timer
    resetTimer();

    // Attach activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, logout]);
}
