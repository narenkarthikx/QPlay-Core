import { useState, useEffect, useCallback } from 'react';

interface PlayerActivityState {
  idleTime: number; // seconds of inactivity
  lastAction: number; // timestamp of last action
  recentFailure: boolean;
  recentSuccess: boolean;
}

export const usePlayerActivity = () => {
  const [activity, setActivity] = useState<PlayerActivityState>({
    idleTime: 0,
    lastAction: Date.now(),
    recentFailure: false,
    recentSuccess: false
  });

  // Reset idle timer on any user interaction
  const resetIdleTimer = useCallback(() => {
    setActivity(prev => ({
      ...prev,
      idleTime: 0,
      lastAction: Date.now()
    }));
  }, []);

  // Mark a failure event
  const markFailure = useCallback(() => {
    setActivity(prev => ({
      ...prev,
      recentFailure: true,
      lastAction: Date.now(),
      idleTime: 0
    }));
    
    // Clear failure flag after 10 seconds
    setTimeout(() => {
      setActivity(prev => ({ ...prev, recentFailure: false }));
    }, 10000);
  }, []);

  // Mark a success event
  const markSuccess = useCallback(() => {
    setActivity(prev => ({
      ...prev,
      recentSuccess: true,
      lastAction: Date.now(),
      idleTime: 0
    }));
    
    // Clear success flag after 5 seconds
    setTimeout(() => {
      setActivity(prev => ({ ...prev, recentSuccess: false }));
    }, 5000);
  }, []);

  // Track idle time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastAction = Math.floor((now - activity.lastAction) / 1000);
      
      setActivity(prev => ({
        ...prev,
        idleTime: timeSinceLastAction
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activity.lastAction]);

  // Listen for user interactions to reset idle timer
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleUserActivity = () => {
      resetIdleTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [resetIdleTimer]);

  return {
    ...activity,
    resetIdleTimer,
    markFailure,
    markSuccess
  };
};