import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Brain, Zap } from 'lucide-react';
import { CompanionCatProps, CatAnimation, CatBehaviorState, CatDialog } from '../types/game';
import catDialogData from '../data/catDialog.json';

const CompanionCat: React.FC<CompanionCatProps> = ({
  currentRoom,
  isRoomCompleted,
  onHintRequest,
  reactionTriggers
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<CatAnimation>('idle');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  const [behaviorState, setBehaviorState] = useState<CatBehaviorState>('entry');
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [quantumEffect, setQuantumEffect] = useState(false);
  const [isLookingAtMouse, setIsLookingAtMouse] = useState(false);
  const [eyeDirection, setEyeDirection] = useState({ x: 0, y: 0 });
  const [failureCount, setFailureCount] = useState(0);
  const [clickMessageIndex, setClickMessageIndex] = useState(0);
  const [catSize, setCatSize] = useState(120);
  const [currentPosition, setCurrentPosition] = useState({ x: 60, y: 60 });

  // Responsive positioning system - dynamically finds safe zones avoiding UI conflicts
  const findOptimalPosition = useCallback(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Calculate responsive cat size based on viewport - "gargantuan" presence
    const minSize = 160;
    const maxSize = 240;
    // Target ~20% screen height or 200-240px for gargantuan feel
    const screenHeightSize = viewport.height * 0.2;
    const responsiveSize = Math.min(maxSize, Math.max(minSize, Math.max(screenHeightSize, viewport.width * 0.12)));
    setCatSize(responsiveSize);
    
    // Define potential positions (corners and sides) with priority order
    const potentialPositions = [
      // Bottom corners (preferred for stability)
      { x: 20, y: viewport.height - responsiveSize - 20, priority: 1, zone: 'bottom-left' },
      { x: viewport.width - responsiveSize - 20, y: viewport.height - responsiveSize - 20, priority: 2, zone: 'bottom-right' },
      
      // Side middle positions
      { x: 20, y: (viewport.height - responsiveSize) / 2, priority: 3, zone: 'left-middle' },
      { x: viewport.width - responsiveSize - 20, y: (viewport.height - responsiveSize) / 2, priority: 4, zone: 'right-middle' },
      
      // Top corners (less preferred)
      { x: 20, y: 80, priority: 5, zone: 'top-left' },
      { x: viewport.width - responsiveSize - 20, y: 80, priority: 6, zone: 'top-right' }
    ];
    
    // UI collision zones by room (updated for larger gargantuan cat size)
    const uiCollisionZones = {
      'probability-bay': [
        { x: viewport.width / 2 - 180, y: viewport.height - 250, width: 360, height: 200 }, // Dice area (expanded)
        { x: viewport.width / 2 - 200, y: 100, width: 400, height: 120 }, // Tutorial/controls
        { x: 0, y: 0, width: viewport.width, height: 80 } // Top header bar
      ],
      'state-chamber': [
        { x: viewport.width / 2 - 250, y: viewport.height / 2 - 150, width: 500, height: 300 }, // Central controls (expanded)
        { x: 0, y: 0, width: viewport.width, height: 80 } // Top bar
      ],
      'superposition-tower': [
        { x: viewport.width / 2 - 200, y: 100, width: 400, height: 450 }, // Tower structure (expanded)
        { x: viewport.width / 2 - 150, y: viewport.height - 120, width: 300, height: 100 } // Bottom controls (expanded)
      ],
      'entanglement-bridge': [
        { x: viewport.width / 2 - 300, y: viewport.height / 2 - 75, width: 600, height: 150 }, // Bridge area (expanded)
        { x: 50, y: viewport.height - 180, width: 250, height: 130 } // Control panel (expanded)
      ],
      'tunneling-vault': [
        { x: viewport.width / 2 - 200, y: viewport.height / 2 - 150, width: 400, height: 300 }, // Vault interface (expanded)
        { x: viewport.width - 300, y: 100, width: 250, height: 350 } // Side panels (expanded)
      ],
      'quantum-archive': [
        { x: 120, y: 120, width: viewport.width - 240, height: viewport.height - 280 }, // Archive panels (adjusted)
        { x: viewport.width / 2 - 150, y: viewport.height - 100, width: 300, height: 80 } // Bottom controls (expanded)
      ]
    };
    
    // Check for collisions with UI elements
    const hasCollision = (pos: typeof potentialPositions[0], zones: typeof uiCollisionZones['probability-bay']) => {
      const catBounds = {
        x: pos.x,
        y: pos.y,
        width: responsiveSize,
        height: responsiveSize
      };
      
      return zones.some(zone => {
        return !(catBounds.x + catBounds.width < zone.x ||
                catBounds.x > zone.x + zone.width ||
                catBounds.y + catBounds.height < zone.y ||
                catBounds.y > zone.y + zone.height);
      });
    };
    
    // Find best position without collisions
    const currentRoomZones = uiCollisionZones[currentRoom] || [];
    const safePositions = potentialPositions.filter(pos => !hasCollision(pos, currentRoomZones));
    
    // Use the highest priority safe position, or fallback to safest position
    const optimalPosition = safePositions.length > 0 
      ? safePositions.sort((a, b) => a.priority - b.priority)[0]
      : { x: 20, y: viewport.height - responsiveSize - 20, priority: 1, zone: 'bottom-left' };
    
    return { x: optimalPosition.x, y: optimalPosition.y };
  }, [currentRoom]);

  // Update position when room changes or window resizes
  useEffect(() => {
    const updatePosition = () => {
      const newPosition = findOptimalPosition();
      setCurrentPosition(newPosition);
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [findOptimalPosition]);

  // Get responsive position - now uses dynamic calculation
  const getRoomPosition = useCallback(() => {
    return currentPosition;
  }, [currentPosition]);

  // Enhanced speech bubble positioning to avoid UI conflicts
  const getSpeechBubblePosition = useCallback(() => {
    const catPos = getRoomPosition();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const bubbleWidth = 260;
    const bubbleHeight = 80; // Approximate height
    
    // Try right side first (preferred)
    let bubbleX = catPos.x + catSize + 20;
    let bubbleY = Math.max(catPos.y - 20, 20);
    
    // If bubble would go off-screen right, position to the left
    if (bubbleX + bubbleWidth > viewport.width - 20) {
      bubbleX = catPos.x - bubbleWidth - 20;
    }
    
    // If bubble would go off-screen bottom, adjust up
    if (bubbleY + bubbleHeight > viewport.height - 20) {
      bubbleY = viewport.height - bubbleHeight - 20;
    }
    
    // Ensure bubble stays on-screen horizontally
    if (bubbleX < 20) {
      bubbleX = 20;
    }
    
    return { x: bubbleX, y: bubbleY };
  }, [getRoomPosition, catSize]);
  const getRoomDialog = useCallback((state?: string): CatDialog | null => {
    const roomData = (catDialogData as any)[currentRoom];
    const dialogState = state || behaviorState;
    if (!roomData || !roomData[dialogState]) return null;
    
    return {
      room: currentRoom,
      state: dialogState as CatBehaviorState,
      messages: roomData[dialogState].messages || [],
      hints: roomData[dialogState].hints || [],
      educationalFacts: roomData[dialogState].educationalFacts || [],
      stories: roomData[dialogState].stories || []
    };
  }, [currentRoom, behaviorState]);

  // Reaction trigger handlers
  useEffect(() => {
    if (reactionTriggers?.onMeasureClick) {
      const originalCallback = reactionTriggers.onMeasureClick;
      reactionTriggers.onMeasureClick = () => {
        setLastInteraction(Date.now());
        const dialog = getRoomDialog('onMeasure');
        if (dialog && dialog.messages.length > 0) {
          const message = dialog.messages[Math.floor(Math.random() * dialog.messages.length)];
          setCurrentMessage(message);
          setShowMessage(true);
          setCurrentAnimation('looking');
          setTimeout(() => setShowMessage(false), 3000);
          setTimeout(() => setCurrentAnimation('idle'), 2000);
        }
        originalCallback();
      };
    }

    if (reactionTriggers?.onFailure) {
      const originalCallback = reactionTriggers.onFailure;
      reactionTriggers.onFailure = (attempt: number) => {
        setFailureCount(attempt);
        setLastInteraction(Date.now());
        const dialog = getRoomDialog('onFail');
        if (dialog && dialog.messages.length > 0) {
          // Escalating help based on failure count
          let message: string;
          if (attempt === 1) {
            message = dialog.messages[0] || "Hmm... try the highest frequency bar.";
          } else if (attempt >= 3) {
            message = dialog.messages[2] || "*nuzzles encouragingly* Look for the tallest bar - it shows the dominant outcome!";
          } else {
            message = dialog.messages[1] || "*gentle meow* Don't worry. Quantum learning takes time. Focus on the highest frequency.";
          }
          
          setCurrentMessage(message);
          setShowMessage(true);
          setCurrentAnimation('looking');
          setTimeout(() => setShowMessage(false), 4000);
          setTimeout(() => setCurrentAnimation('idle'), 2000);
        }
        originalCallback(attempt);
      };
    }

    if (reactionTriggers?.onSuccess) {
      const originalCallback = reactionTriggers.onSuccess;
      reactionTriggers.onSuccess = () => {
        setLastInteraction(Date.now());
        const dialog = getRoomDialog('onSuccess');
        if (dialog && dialog.messages.length > 0) {
          const message = dialog.messages[Math.floor(Math.random() * dialog.messages.length)];
          setCurrentMessage(message);
          setShowMessage(true);
          setCurrentAnimation('celebrating');
          setQuantumEffect(true);
          setTimeout(() => setShowMessage(false), 4000);
          setTimeout(() => {
            setCurrentAnimation('idle');
            setQuantumEffect(false);
          }, 3000);
        }
        originalCallback();
      };
    }
  }, [reactionTriggers, getRoomDialog]);

  // Mouse tracking for eye movement - use dynamic position
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const currentPosition = getRoomPosition();
    const catCenterX = currentPosition.x + catSize / 2;
    const catCenterY = currentPosition.y + catSize / 3;
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
  }, [getRoomPosition, catSize]);

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

  // Cat interaction handler with exactly 3 rotating contextual messages
  const handleCatClick = useCallback(() => {
    setLastInteraction(Date.now());
    
    if (behaviorState === 'stuck') {
      handleHintRequest();
    } else {
      // Rotate through exactly 3 types: educational concept, story/fun fact, hint
      const dialog = getRoomDialog();
      if (dialog) {
        let message: string = '';
        
        switch (clickMessageIndex % 3) {
          case 0: // Educational concept
            if (dialog.educationalFacts && dialog.educationalFacts.length > 0) {
              message = dialog.educationalFacts[Math.floor(Math.random() * dialog.educationalFacts.length)];
            } else if (dialog.messages && dialog.messages.length > 0) {
              message = dialog.messages[0];
            }
            break;
          case 1: // Story or fun fact
            if (dialog.stories && dialog.stories.length > 0) {
              message = dialog.stories[Math.floor(Math.random() * dialog.stories.length)];
            } else if (dialog.messages && dialog.messages.length > 1) {
              message = dialog.messages[1];
            }
            break;
          case 2: // Optional hint
            if (dialog.hints && dialog.hints.length > 0) {
              message = dialog.hints[Math.floor(Math.random() * dialog.hints.length)];
            } else if (dialog.messages && dialog.messages.length > 2) {
              message = dialog.messages[2];
            } else if (dialog.messages && dialog.messages.length > 0) {
              message = dialog.messages[Math.floor(Math.random() * dialog.messages.length)];
            }
            break;
        }
        
        if (message) {
          setCurrentMessage(message);
          setShowMessage(true);
          setClickMessageIndex(prev => prev + 1);
          setCurrentAnimation('looking');
          setTimeout(() => setShowMessage(false), 3500);
          setTimeout(() => setCurrentAnimation('idle'), 2000);
        }
      }
    }
  }, [behaviorState, handleHintRequest, getRoomDialog, clickMessageIndex]);

  // Animation variants for stationary, reactive cat - very subtle animations
  const catVariants = {
    idle: {
      scale: [1, 1.01, 1],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    },
    sitting: {
      scale: [1, 0.99, 1],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    },
    celebrating: {
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 0.8, repeat: 2, ease: "easeInOut" }
    },
    sleeping: {
      scale: [1, 0.98, 1],
      opacity: [1, 0.95, 1],
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut" }
    },
    looking: {
      rotate: [0, isLookingAtMouse ? eyeDirection.x * 0.5 : 1, isLookingAtMouse ? eyeDirection.x * 0.5 : -1, 0],
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    sniffing: {
      // Very subtle breathing effect only
      scale: [1, 1.02, 1],
      transition: { duration: 2, ease: "easeInOut" }
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
          width: catSize, 
          height: catSize 
        }}
        animate={catVariants[currentAnimation]}
        onClick={handleCatClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Cat Body */}
        <div className="relative w-full h-full">
          {/* Main Cat SVG */}
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg"
               style={{ width: catSize, height: catSize }}>
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

      {/* Speech Bubble - Enhanced positioning with UI collision avoidance */}
      <AnimatePresence>
        {showMessage && currentMessage && (
          <motion.div
            className="absolute bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-xl p-3 pointer-events-auto shadow-lg"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              left: getSpeechBubblePosition().x,
              top: getSpeechBubblePosition().y,
              maxWidth: '260px', // Updated to user requested 260px max width
              minWidth: '200px'
            }}
          >
            <div className="text-sm text-gray-200 leading-relaxed font-medium">
              {currentMessage}
            </div>
            
            {/* Speech bubble tail - dynamically positioned based on cat location */}
            <div 
              className="absolute w-0 h-0 border-transparent"
              style={{
                left: getSpeechBubblePosition().x < getRoomPosition().x ? '100%' : -8,
                top: 20,
                borderLeftWidth: getSpeechBubblePosition().x < getRoomPosition().x ? 0 : 8,
                borderRightWidth: getSpeechBubblePosition().x < getRoomPosition().x ? 8 : 8,
                borderTopWidth: 8,
                borderTopColor: '#4b5563'
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
            left: getRoomPosition().x + catSize / 2 - 30,
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