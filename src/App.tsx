import React, { useState, useEffect } from 'react';
import { Play, Home, Settings, Trophy, Zap } from 'lucide-react';
import MainMenu from './components/MainMenu';
import GameController from './components/GameController';
import { GameProvider } from './contexts/GameContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { Room } from './types/game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'settings'>('menu');
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <AuthProvider>
      <SettingsProvider>
        <GameProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-rajdhani transition-colors duration-300">
              {/* Animated background particles */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.3),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,119,198,0.2),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {currentScreen === 'menu' && (
                  <MainMenu onStartGame={() => {
                    setCurrentScreen('game');
                    setGameStarted(true);
                  }} />
                )}
                
                {currentScreen === 'game' && gameStarted && (
                  <GameController onBackToMenu={() => {
                    setCurrentScreen('menu');
                    setGameStarted(false);
                  }} />
                )}
              </div>
            </div>
          </ThemeProvider>
        </GameProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;