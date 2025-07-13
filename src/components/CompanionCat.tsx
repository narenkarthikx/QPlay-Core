import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Brain, Zap } from 'lucide-react';
import { CompanionCatProps, CatAnimation, CatBehaviorState, CatDialog } from '../types/game';
import catDialogData from '../data/catDialog.json';

const CompanionCat: React.FC<CompanionCatProps> = ({
  currentRoom,
  isRoomCompleted,
  onHintRequest
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<CatAnimation>('idle');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  // Per-room positioning system - fixed positions that don't overlap with UI
  const getRoomPosition = useCallback(() => {
    const roomPositions = {
      'probability-bay': { x: 60, y: window.innerHeight - 180 }, // Left-bottom - safe from dice area
      'state-chamber': { x: 60, y: window.innerHeight / 2 - 60 }, // Left-middle - safe from controls
      'superposition-tower': { x: 60, y: window.innerHeight - 180 }, // Left-bottom - safe from tower UI
      'entanglement-bridge': { x: 60, y: window.innerHeight / 2 - 60 }, // Left-middle - safe from bridge controls
      'tunneling-vault': { x: 60, y: window.innerHeight - 180 }, // Left-bottom - safe from vault interface
      'quantum-archive': { x: 60, y: window.innerHeight / 2 - 60 } // Left-middle - safe from archive panels
    };
    
    return roomPositions[currentRoom] || { x: 60, y: window.innerHeight - 180 };
  }, [currentRoom]);

  const [behaviorState, setBehaviorState] = useState<CatBehaviorState>('entry');
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [quantumEffect, setQuantumEffect] = useState(false);
  const [isLookingAtMouse, setIsLookingAtMouse] = useState(false);
  const [eyeDirection, setEyeDirection] = useState({ x: 0, y: 0 });

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

  // Mouse tracking for eye movement - use dynamic position
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const currentPosition = getRoomPosition();
    const catCenterX = currentPosition.x + 60;
    const catCenterY = currentPosition.y + 40;
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Calculate direction from cat to mouse (limited range)
    const deltaX = mouseX - catCenterX;
    const deltaY = mouseY - catCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only look if mouse is reasonably close (within 300px)
    if (distance < 300) {
      setIsLookingAtMouse(true);
      const maxEyeMovement = 3; // Subtle eye movement
      setEyeDirection({
        x: Math.max(-maxEyeMovement, Math.min(maxEyeMovement, deltaX / 50)),
        y: Math.max(-maxEyeMovement, Math.min(maxEyeMovement, deltaY / 50))
      });
    } else {
      setIsLookingAtMouse(false);
      setEyeDirection({ x: 0, y: 0 });
    }
  }, [getRoomPosition]);

  // Track mouse movement for eye reactions
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

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

  // Subtle micro-behaviors for stationary cat
  const updateMicroBehaviors = useCallback(() => {
    const random = Math.random();
    
    // Only small reactions, no movement
    if (random < 0.1) {
      // Occasional ear flick or tail movement (via slight animations)
      setCurrentAnimation('sniffing');
      setTimeout(() => setCurrentAnimation('idle'), 1500);
    } else if (random < 0.05 && behaviorState === 'stuck') {
      // Show subtle concern
      showRandomMessage();
    }
  }, [behaviorState, showRandomMessage]);

  // Handle room changes - behavior only, no movement
  useEffect(() => {
    setBehaviorState('entry');
    setCurrentAnimation('looking'); // Just a gentle look, no walking
    setLastInteraction(Date.now());
    
    // Show entry message after a brief delay
    setTimeout(() => {
      showRandomMessage();
      setCurrentAnimation('sitting');
    }, 1000);
  }, [currentRoom, showRandomMessage]);

  // Periodic behavior updates
  useEffect(() => {
    const behaviorInterval = setInterval(() => {
      updateBehaviorState();
      updateMicroBehaviors();
    }, 8000); // Slower, more subtle updates

    return () => clearInterval(behaviorInterval);
  }, [updateBehaviorState, updateMicroBehaviors]);

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

  // Animation variants for stationary, reactive cat - NO positional movement
  const catVariants = {
    idle: {
      scale: [1, 1.02, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    sitting: {
      scale: [1, 0.98, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    celebrating: {
      scale: [1, 1.1, 1],
      rotate: [0, 3, -3, 0],
      transition: { duration: 0.6, repeat: 3, ease: "easeInOut" }
    },
    sleeping: {
      scale: [1, 0.95, 1],
      opacity: [1, 0.9, 1],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    },
    looking: {
      rotate: [0, isLookingAtMouse ? eyeDirection.x * 1 : 2, isLookingAtMouse ? eyeDirection.x * 1 : -2, 0],
      transition: { duration: 2, ease: "easeInOut" }
    },
    sniffing: {
      // Removed y-movement, only scale for breathing effect
      scale: [1, 1.03, 1],
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  };

  const quantumEffectVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      rotate: [0, 180, 360],
      transition: { duration: 2, ease: [0.23, 1, 0.32, 1] }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Cat Character - Room-Specific Fixed Position */}
      <motion.div
        className="absolute pointer-events-auto cursor-pointer select-none"
        style={{ 
          x: getRoomPosition().x, 
          y: getRoomPosition().y,
          width: 120, 
          height: 120 
        }}
        animate={catVariants[currentAnimation]}
        onClick={handleCatClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
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
            
            {/* Cat face features with responsive eyes */}
            <circle cx={52 + eyeDirection.x} cy={35 + eyeDirection.y} r="3" fill="#fff" opacity="0.9" />
            <circle cx={68 + eyeDirection.x} cy={35 + eyeDirection.y} r="3" fill="#fff" opacity="0.9" />
            <circle cx={52 + eyeDirection.x} cy={37 + eyeDirection.y} r="1.5" fill="#1f2937" />
            <circle cx={68 + eyeDirection.x} cy={37 + eyeDirection.y} r="1.5" fill="#1f2937" />
            
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

      {/* Speech Bubble - Dynamic positioning */}
      <AnimatePresence>
        {showMessage && currentMessage && (
          <motion.div
            className="absolute bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-xl p-4 max-w-sm pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              left: getRoomPosition().x + 140, // Position to the right of cat
              top: Math.max(getRoomPosition().y - 20, 20),
            }}
          >
            <div className="text-sm text-gray-200 leading-relaxed">
              {currentMessage}
            </div>
            
            {/* Speech bubble tail - positioned for left-side cat */}
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

      {/* Hint button overlay - Dynamic positioning */}
      {behaviorState === 'stuck' && (
        <motion.button
          className="absolute bg-yellow-500/90 hover:bg-yellow-400/90 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold pointer-events-auto"
          style={{
            left: getRoomPosition().x + 60,
            top: getRoomPosition().y - 30,
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