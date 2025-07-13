import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Brain, Zap } from 'lucide-react';
import { CompanionCatProps, CatAnimation, CatBehaviorState, CatDialog, SafeZone } from '../types/game';
import catDialogData from '../data/catDialog.json';

const CompanionCat: React.FC<CompanionCatProps> = ({
  currentRoom,
  isRoomCompleted,
  onHintRequest,
  safeZones
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<CatAnimation>('idle');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 50, y: 50 });
  const [behaviorState, setBehaviorState] = useState<CatBehaviorState>('entry');
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [quantumEffect, setQuantumEffect] = useState(false);
  const [personality, setPersonality] = useState({ curiosity: 0.8, helpfulness: 0.9, playfulness: 0.7 });

  // Get dialog data for current room and state
  const getRoomDialog = useCallback((): CatDialog | null => {
    const roomData = (catDialogData as any)[currentRoom];
    if (!roomData || !roomData[behaviorState]) return null;
    
    return {
      room: currentRoom,
      state: behaviorState,
      messages: roomData[behaviorState].messages || [],
      hints: roomData[behaviorState].hints || [],
      educationalFacts: roomData[behaviorState].educationalFacts || [],
      stories: roomData[behaviorState].stories || []
    };
  }, [currentRoom, behaviorState]);

  // Calculate safe position avoiding UI overlaps
  const calculateSafePosition = useCallback((): { x: number; y: number } => {
    const catSize = { width: 120, height: 120 };
    const margin = 20;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    // Default safe zones (corners and sides)
    const defaultSafeZones: SafeZone[] = [
      { id: 'top-left', x: margin, y: margin, width: catSize.width, height: catSize.height },
      { id: 'top-right', x: viewportWidth - catSize.width - margin, y: margin, width: catSize.width, height: catSize.height },
      { id: 'bottom-left', x: margin, y: viewportHeight - catSize.height - margin, width: catSize.width, height: catSize.height },
      { id: 'bottom-right', x: viewportWidth - catSize.width - margin, y: viewportHeight - catSize.height - margin, width: catSize.width, height: catSize.height },
      { id: 'center-left', x: margin, y: viewportHeight / 2 - catSize.height / 2, width: catSize.width, height: catSize.height },
      { id: 'center-right', x: viewportWidth - catSize.width - margin, y: viewportHeight / 2 - catSize.height / 2, width: catSize.width, height: catSize.height }
    ];

    const availableZones = [...safeZones, ...defaultSafeZones];
    
    // Choose a random safe zone
    const randomZone = availableZones[Math.floor(Math.random() * availableZones.length)];
    return { x: randomZone.x, y: randomZone.y };
  }, [safeZones]);

  // Show random message based on current state
  const showRandomMessage = useCallback(() => {
    const dialog = getRoomDialog();
    if (!dialog) return;

    let messagePool: string[] = [];
    
    switch (behaviorState) {
      case 'entry':
        messagePool = [...dialog.messages, ...(dialog.educationalFacts || [])];
        break;
      case 'idle':
        messagePool = [...dialog.messages, ...(dialog.stories || [])];
        break;
      case 'stuck':
        messagePool = [...dialog.messages, ...(dialog.hints || [])];
        break;
      case 'success':
        messagePool = dialog.messages;
        break;
      case 'hint':
        messagePool = dialog.messages;
        break;
      default:
        messagePool = dialog.messages;
    }

    if (messagePool.length > 0) {
      const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
      setCurrentMessage(randomMessage);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000 + randomMessage.length * 50);
    }
  }, [behaviorState, getRoomDialog]);

  // Determine behavior state based on room progress and time
  const updateBehaviorState = useCallback(() => {
    const timeSinceLastInteraction = Date.now() - lastInteraction;
    
    if (isRoomCompleted && behaviorState !== 'success') {
      setBehaviorState('success');
      setCurrentAnimation('celebrating');
      setQuantumEffect(true);
      setTimeout(() => setQuantumEffect(false), 3000);
    } else if (timeSinceLastInteraction > 60000 && behaviorState !== 'stuck') {
      // If no interaction for 1 minute, assume stuck
      setBehaviorState('stuck');
      setCurrentAnimation('looking');
    } else if (timeSinceLastInteraction < 10000 && behaviorState === 'entry') {
      // Stay in entry mode for first 10 seconds
      return;
    } else if (behaviorState === 'entry') {
      setBehaviorState('idle');
      setCurrentAnimation('sitting');
    }
  }, [isRoomCompleted, lastInteraction, behaviorState]);

  // AI-like behavior patterns
  const updateAIBehavior = useCallback(() => {
    const random = Math.random();
    
    // Personality-driven behavior
    if (random < personality.curiosity * 0.3) {
      setCurrentAnimation('sniffing');
      setTimeout(() => setCurrentAnimation('idle'), 2000);
    } else if (random < personality.playfulness * 0.2) {
      setCurrentAnimation('walking');
      // Move to new safe position
      setTimeout(() => {
        setCurrentPosition(calculateSafePosition());
        setCurrentAnimation('sitting');
      }, 1500);
    } else if (random < personality.helpfulness * 0.4 && behaviorState === 'stuck') {
      showRandomMessage();
    }
  }, [personality, behaviorState, calculateSafePosition, showRandomMessage]);

  // Handle room changes
  useEffect(() => {
    setBehaviorState('entry');
    setCurrentAnimation('walking');
    setCurrentPosition(calculateSafePosition());
    setLastInteraction(Date.now());
    
    // Show entry message after a brief delay
    setTimeout(() => {
      showRandomMessage();
      setCurrentAnimation('sitting');
    }, 1000);
  }, [currentRoom, calculateSafePosition, showRandomMessage]);

  // Periodic behavior updates
  useEffect(() => {
    const behaviorInterval = setInterval(() => {
      updateBehaviorState();
      updateAIBehavior();
    }, 5000);

    return () => clearInterval(behaviorInterval);
  }, [updateBehaviorState, updateAIBehavior]);

  // Handle hint requests
  const handleHintRequest = useCallback(() => {
    setBehaviorState('hint');
    setCurrentAnimation('looking');
    setLastInteraction(Date.now());
    
    const dialog = getRoomDialog();
    if (dialog && dialog.hints && dialog.hints.length > 0) {
      const hint = dialog.hints[Math.floor(Math.random() * dialog.hints.length)];
      setCurrentMessage(hint);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
    
    setQuantumEffect(true);
    setTimeout(() => setQuantumEffect(false), 2000);
    
    onHintRequest();
    
    // Return to previous state after hint
    setTimeout(() => {
      setBehaviorState(isRoomCompleted ? 'success' : 'idle');
      setCurrentAnimation('idle');
    }, 3000);
  }, [getRoomDialog, onHintRequest, isRoomCompleted]);

  // Cat interaction handler
  const handleCatClick = useCallback(() => {
    setLastInteraction(Date.now());
    
    if (behaviorState === 'stuck') {
      handleHintRequest();
    } else {
      showRandomMessage();
      setCurrentAnimation('looking');
      setTimeout(() => setCurrentAnimation('idle'), 2000);
    }
  }, [behaviorState, handleHintRequest, showRandomMessage]);

  // Animation variants
  const catVariants = {
    idle: {
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    walking: {
      x: [0, 10, -10, 0],
      y: [0, -5, 0],
      rotate: [0, 5, -5, 0],
      transition: { duration: 1.5, repeat: 2, ease: "easeInOut" }
    },
    sitting: {
      scale: [1, 0.95, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    celebrating: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      y: [0, -20, 0],
      transition: { duration: 0.8, repeat: 3, ease: "easeInOut" }
    },
    sleeping: {
      scale: [1, 0.9, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    looking: {
      rotate: [0, 15, -15, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: 2, ease: "easeInOut" }
    },
    sniffing: {
      y: [0, -5, -10, -5, 0],
      scale: [1, 1.05, 1.1, 1.05, 1],
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  const quantumEffectVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      rotate: [0, 180, 360],
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Cat Character */}
      <motion.div
        className="absolute pointer-events-auto cursor-pointer select-none"
        initial={{ x: currentPosition.x, y: currentPosition.y }}
        animate={{ 
          x: currentPosition.x, 
          y: currentPosition.y,
          ...catVariants[currentAnimation]
        }}
        onClick={handleCatClick}
        style={{ width: 120, height: 120 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Cat Body */}
        <div className="relative w-full h-full">
          {/* Main Cat SVG */}
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
            {/* Cat silhouette with quantum glow */}
            <defs>
              <filter id="quantumGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
            
            {/* Cat body */}
            <ellipse cx="60" cy="70" rx="35" ry="25" fill="url(#catGradient)" filter="url(#quantumGlow)" />
            
            {/* Cat head */}
            <circle cx="60" cy="40" r="25" fill="url(#catGradient)" filter="url(#quantumGlow)" />
            
            {/* Cat ears */}
            <polygon points="45,25 40,10 55,20" fill="url(#catGradient)" />
            <polygon points="75,25 80,10 65,20" fill="url(#catGradient)" />
            
            {/* Cat tail */}
            <path d="M 95 70 Q 110 50 105 30" stroke="url(#catGradient)" strokeWidth="8" fill="none" strokeLinecap="round" />
            
            {/* Cat legs */}
            <ellipse cx="45" cy="95" rx="6" ry="12" fill="url(#catGradient)" />
            <ellipse cx="75" cy="95" rx="6" ry="12" fill="url(#catGradient)" />
            
            {/* Cat face features */}
            <circle cx="52" cy="35" r="3" fill="#fff" opacity="0.9" />
            <circle cx="68" cy="35" r="3" fill="#fff" opacity="0.9" />
            <circle cx="52" cy="37" r="1.5" fill="#1f2937" />
            <circle cx="68" cy="37" r="1.5" fill="#1f2937" />
            
            {/* Cat nose */}
            <polygon points="60,42 58,46 62,46" fill="#ec4899" />
            
            {/* Cat whiskers */}
            <line x1="30" y1="42" x2="45" y2="40" stroke="#fff" strokeWidth="1" opacity="0.8" />
            <line x1="30" y1="48" x2="45" y2="46" stroke="#fff" strokeWidth="1" opacity="0.8" />
            <line x1="75" y1="40" x2="90" y2="42" stroke="#fff" strokeWidth="1" opacity="0.8" />
            <line x1="75" y1="46" x2="90" y2="48" stroke="#fff" strokeWidth="1" opacity="0.8" />
          </svg>

          {/* Quantum effects */}
          <AnimatePresence>
            {quantumEffect && (
              <>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  variants={quantumEffectVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  variants={quantumEffectVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{ animationDelay: '0.5s' }}
                >
                  <Zap className="w-6 h-6 text-blue-400" />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Behavior state indicator */}
          <div className="absolute -top-2 -right-2">
            {behaviorState === 'stuck' && <Brain className="w-4 h-4 text-orange-400 animate-pulse" />}
            {behaviorState === 'success' && <Heart className="w-4 h-4 text-green-400 animate-bounce" />}
            {behaviorState === 'hint' && <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />}
          </div>
        </div>
      </motion.div>

      {/* Speech Bubble */}
      <AnimatePresence>
        {showMessage && currentMessage && (
          <motion.div
            className="absolute bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-xl p-4 max-w-sm pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              left: Math.min(currentPosition.x + 140, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300),
              top: Math.max(currentPosition.y - 20, 20),
            }}
          >
            <div className="text-sm text-gray-200 leading-relaxed">
              {currentMessage}
            </div>
            
            {/* Speech bubble tail */}
            <div 
              className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-600"
              style={{
                left: -8,
                top: 20,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint button overlay */}
      {behaviorState === 'stuck' && (
        <motion.button
          className="absolute bg-yellow-500/90 hover:bg-yellow-400/90 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold pointer-events-auto"
          style={{
            left: currentPosition.x + 60,
            top: currentPosition.y - 30,
          }}
          onClick={handleHintRequest}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          💡 Need Help?
        </motion.button>
      )}
    </div>
  );
};

export default CompanionCat;