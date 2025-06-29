import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GameState, Room } from '../types/game';

interface GameContextType {
  gameState: GameState;
  currentRoom: Room;
  setCurrentRoom: (room: Room) => void;
  completeRoom: (room: Room) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
  completedRooms: [],
  currentProgress: 0,
  achievements: [],
  totalScore: 0
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentRoom, setCurrentRoom] = useState<Room>('probability-bay');

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedGameState = localStorage.getItem('quantumQuestGameState');
    const savedCurrentRoom = localStorage.getItem('quantumQuestCurrentRoom');
    
    if (savedGameState) {
      setGameState(JSON.parse(savedGameState));
    }
    
    if (savedCurrentRoom) {
      setCurrentRoom(savedCurrentRoom as Room);
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quantumQuestGameState', JSON.stringify(gameState));
  }, [gameState]);

  // Save current room to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quantumQuestCurrentRoom', currentRoom);
  }, [currentRoom]);

  const completeRoom = (room: Room) => {
    setGameState(prev => ({
      ...prev,
      completedRooms: prev.completedRooms.includes(room) 
        ? prev.completedRooms 
        : [...prev.completedRooms, room],
      currentProgress: Math.max(prev.currentProgress, prev.completedRooms.length + 1),
      totalScore: prev.totalScore + 100
    }));
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setCurrentRoom('probability-bay');
    localStorage.removeItem('quantumQuestGameState');
    localStorage.removeItem('quantumQuestCurrentRoom');
  };

  return (
    <GameContext.Provider value={{
      gameState,
      currentRoom,
      setCurrentRoom,
      completeRoom,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};