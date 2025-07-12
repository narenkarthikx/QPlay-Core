import React, { createContext, useContext, ReactNode } from 'react';
import { usePlayerActivity } from '../hooks/usePlayerActivity';

interface PlayerActivityContextType {
  idleTime: number;
  lastAction: number;
  recentFailure: boolean;
  recentSuccess: boolean;
  resetIdleTimer: () => void;
  markFailure: () => void;
  markSuccess: () => void;
}

const PlayerActivityContext = createContext<PlayerActivityContextType | undefined>(undefined);

export const PlayerActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const activity = usePlayerActivity();

  return (
    <PlayerActivityContext.Provider value={activity}>
      {children}
    </PlayerActivityContext.Provider>
  );
};

export const usePlayerActivityContext = () => {
  const context = useContext(PlayerActivityContext);
  if (context === undefined) {
    throw new Error('usePlayerActivityContext must be used within a PlayerActivityProvider');
  }
  return context;
};