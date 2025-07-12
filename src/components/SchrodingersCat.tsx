import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room } from '../types/game';
import { usePlayerActivityContext } from '../contexts/PlayerActivityContext';
import catDialog from '../data/catDialog.json';

type CatBehavior = 'idle' | 'walking' | 'sitting' | 'jumping' | 'observing' | 'sleeping';
type CatPosition = { x: number; y: number };

interface SchrodingersCatProps {
  currentRoom: Room;
  isRoomCompleted: boolean;
  onHintRequest?: () => void;
}

const SchrodingersCat: React.FC<SchrodingersCatProps> = ({
  currentRoom,
  isRoomCompleted,
  onHintRequest
}) => {
  const { idleTime: playerIdleTime, recentFailure, recentSuccess } = usePlayerActivityContext();
  const [behavior, setBehavior] = useState<CatBehavior>('idle');
  const [position, setPosition] = useState<CatPosition>({ x: 20, y: 80 });
  const [currentDialog, setCurrentDialog] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [lastHintTime, setLastHintTime] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Get dialog for current room
  const roomDialog = (catDialog as any)[currentRoom] || catDialog.general;

  // Simple meow sound effect using Web Audio API
  const playMeow = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a meow-like sound
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if Web Audio API is not supported
      console.log('Audio not supported');
    }
  }, []);

  // Cat sprite variations (using CSS for now, could be replaced with actual sprites)
  const getCatSprite = () => {
    switch (behavior) {
      case 'sleeping':
        return '😴';
      case 'jumping':
        return '🐱‍🏍';
      case 'sitting':
        return '🐱‍👤';
      case 'observing':
        return '🔍🐱';
      case 'walking':
        return '🐾';
      default:
        return '😺';
    }
  };

  // Animation variants for different behaviors
  const catVariants = {
    idle: {
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    walking: {
      y: [0, -5, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
    },
    sitting: {
      scale: [1, 0.9, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    jumping: {
      y: [-20, -40, -20],
      scale: [1, 1.2, 1],
      transition: { duration: 0.8, ease: "easeOut" }
    },
    observing: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    sleeping: {
      scale: 0.8,
      opacity: [1, 0.7, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Dialog animation variants
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  // Show dialog with animation
  const showDialogMessage = useCallback((message: string) => {
    setCurrentDialog(message);
    setShowDialog(true);
    setDialogKey(prev => prev + 1);
    
    // Auto-hide dialog after 5 seconds
    setTimeout(() => {
      setShowDialog(false);
    }, 5000);
  }, []);

  // Move cat to a random position
  const moveToRandomPosition = useCallback(() => {
    const newX = Math.random() * 70 + 10; // 10-80% of container width
    const newY = Math.random() * 40 + 60; // 60-100% of container height (bottom area)
    
    setIsFlipped(newX > position.x);
    setPosition({ x: newX, y: newY });
    setBehavior('walking');
    
    // After walking animation, settle into idle or sitting
    setTimeout(() => {
      setBehavior(Math.random() > 0.5 ? 'idle' : 'sitting');
    }, 2000);
  }, [position.x]);

  // Handle room entry greeting
  useEffect(() => {
    if (!hasGreeted) {
      setTimeout(() => {
        showDialogMessage(roomDialog.entry);
        setBehavior('observing');
        setHasGreeted(true);
      }, 1500); // Delay for room transition
    }
  }, [currentRoom, hasGreeted, roomDialog.entry, showDialogMessage]);

  // Handle room completion celebration
  useEffect(() => {
    if (isRoomCompleted) {
      setBehavior('jumping');
      showDialogMessage(roomDialog.solved);
      
      // Return to normal behavior after celebration
      setTimeout(() => {
        setBehavior('sitting');
      }, 2000);
    }
  }, [isRoomCompleted, roomDialog.solved, showDialogMessage]);

  // Handle player idle time
  useEffect(() => {
    if (playerIdleTime >= 30 && playerIdleTime < 60 && !showDialog) {
      const now = Date.now();
      if (now - lastHintTime > 30000) { // Don't spam hints
        showDialogMessage(roomDialog.idle_30s);
        setBehavior('observing');
        setLastHintTime(now);
      }
    } else if (playerIdleTime >= 60 && !showDialog) {
      const now = Date.now();
      if (now - lastHintTime > 60000) {
        showDialogMessage(roomDialog.idle_60s);
        moveToRandomPosition();
        setLastHintTime(now);
      }
    }
  }, [playerIdleTime, showDialog, roomDialog, showDialogMessage, moveToRandomPosition, lastHintTime]);

  // Handle recent failure
  useEffect(() => {
    if (recentFailure && !showDialog) {
      showDialogMessage(roomDialog.failure);
      setBehavior('observing');
      
      // Move closer to "comfort" the player
      setPosition(prev => ({ 
        x: Math.min(prev.x + 20, 70), 
        y: Math.max(prev.y - 10, 60) 
      }));
    }
  }, [recentFailure, roomDialog.failure, showDialog, showDialogMessage]);

  // Handle recent success
  useEffect(() => {
    if (recentSuccess && !showDialog) {
      const celebrations = catDialog.general.celebrate;
      const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];
      showDialogMessage(randomCelebration);
      setBehavior('jumping');
      playMeow(); // Celebratory meow
      
      // Move around excitedly
      setTimeout(() => {
        moveToRandomPosition();
      }, 1000);
    }
  }, [recentSuccess, showDialog, showDialogMessage, moveToRandomPosition, playMeow]);

  // Random behavior changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showDialog && Math.random() > 0.7) {
        const behaviors: CatBehavior[] = ['idle', 'sitting', 'observing'];
        const newBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        setBehavior(newBehavior);
        
        // Occasionally move to a new position
        if (Math.random() > 0.8) {
          moveToRandomPosition();
        }
      }
    }, 8000); // Change behavior every 8 seconds

    return () => clearInterval(interval);
  }, [showDialog, moveToRandomPosition]);

  // Random educational facts
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showDialog && Math.random() > 0.9) {
        const facts = catDialog.general.random_facts;
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        showDialogMessage(randomFact);
        setBehavior('observing');
      }
    }, 45000); // Random fact every 45 seconds

    return () => clearInterval(interval);
  }, [showDialog, showDialogMessage]);

  // Click handler for direct interaction
  const handleCatClick = () => {
    if (!showDialog) {
      const hints = [roomDialog.hint_1, roomDialog.hint_2, roomDialog.hint_3];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      showDialogMessage(randomHint);
      setBehavior('jumping');
      playMeow(); // Interactive meow
      onHintRequest?.();
    }
  };

  // Reset greeting when room changes
  useEffect(() => {
    setHasGreeted(false);
    setBehavior('idle');
    // Reset position to corner when entering new room
    setPosition({ x: 20, y: 80 });
  }, [currentRoom]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Cat Character */}
      <motion.div
        className="absolute pointer-events-auto cursor-pointer select-none"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)'
        }}
        animate={behavior}
        variants={catVariants}
        onClick={handleCatClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-4xl filter drop-shadow-lg">
          {getCatSprite()}
        </div>
      </motion.div>

      {/* Dialog Bubble */}
      <AnimatePresence>
        {showDialog && currentDialog && (
          <motion.div
            key={dialogKey}
            className="absolute pointer-events-none"
            style={{
              left: `${Math.min(position.x + 8, 70)}%`,
              top: `${Math.max(position.y - 15, 10)}%`,
              maxWidth: '300px'
            }}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm 
                          rounded-2xl p-4 border border-purple-400/30 shadow-2xl">
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 left-6 w-0 h-0 
                            border-l-8 border-l-transparent 
                            border-r-8 border-r-transparent 
                            border-t-8 border-t-purple-900/95"></div>
              
              <p className="text-white text-sm font-medium leading-relaxed">
                {currentDialog}
              </p>
              
              {/* Quantum sparkles effect */}
              <div className="absolute -top-1 -right-1 text-xs opacity-70 animate-pulse">
                ✨
              </div>
              
              {/* Quantum wave effect when cat is speaking */}
              {showDialog && (
                <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/30 animate-ping opacity-30"></div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchrodingersCat;