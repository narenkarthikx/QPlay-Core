import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanionCatProps {
  roomBounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  safeZones?: Array<{
    left: number;
    top: number;
    right: number;
    bottom: number;
  }>;
}

interface Position {
  x: number;
  y: number;
}

const CompanionCat: React.FC<CompanionCatProps> = ({ 
  roomBounds,
  safeZones = []
}) => {
  const [position, setPosition] = useState<Position>({ x: 200, y: 200 });
  const [isIdle, setIsIdle] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogText, setDialogText] = useState('');
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update window size on mount and resize
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Calculate dynamic room bounds based on window size
  const dynamicRoomBounds = roomBounds || {
    left: 120,
    top: 120,
    right: windowSize.width - 300,
    bottom: windowSize.height - 200
  };

  // Framer Motion variants with proper TypeScript types and transition syntax
  const catVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      transition: { ease: "easeInOut", duration: 0.5 }
    },
    walking: {
      scale: 1.05,
      rotate: [-2, 2, -2],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 0.6,
          ease: "easeInOut"
        },
        scale: { ease: "easeInOut", duration: 0.3 }
      }
    },
    hover: {
      scale: 1.1,
      transition: { ease: "easeInOut", duration: 0.3 }
    }
  };

  const dialogVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { ease: "easeInOut", duration: 0.2 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { ease: "easeInOut", duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: { ease: "easeInOut", duration: 0.2 }
    }
  };

  // Check if a position is within safe zones
  const isPositionSafe = (pos: Position): boolean => {
    if (safeZones.length === 0) return true;
    
    return safeZones.some(zone => 
      pos.x >= zone.left && 
      pos.x <= zone.right && 
      pos.y >= zone.top && 
      pos.y <= zone.bottom
    );
  };

  // Generate a random safe position
  const generateSafePosition = (): Position => {
    let attempts = 0;
    let newPos: Position;
    
    do {
      newPos = {
        x: Math.random() * (dynamicRoomBounds.right - dynamicRoomBounds.left) + dynamicRoomBounds.left,
        y: Math.random() * (dynamicRoomBounds.bottom - dynamicRoomBounds.top) + dynamicRoomBounds.top
      };
      attempts++;
    } while (!isPositionSafe(newPos) && attempts < 50);
    
    // If no safe position found after 50 attempts, use a default safe position
    if (attempts >= 50) {
      newPos = { x: dynamicRoomBounds.left + 100, y: dynamicRoomBounds.top + 100 };
    }
    
    return newPos;
  };

  // Random movement logic
  useEffect(() => {
    const moveRandomly = () => {
      const shouldMove = Math.random() > 0.7; // 30% chance to move
      
      if (shouldMove) {
        setIsIdle(false);
        const newPosition = generateSafePosition();
        setPosition(newPosition);
        
        setTimeout(() => {
          setIsIdle(true);
        }, 1000);
      }
    };

    moveIntervalRef.current = setInterval(moveRandomly, 3000);
    
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [windowSize, safeZones]);

  // Dialog messages
  const dialogMessages = [
    "Quantum mechanics is fascinating! 🌟",
    "Did you know cats can be in superposition? 😸",
    "Schrödinger would be proud! 🧪",
    "The quantum realm is full of mysteries... 🔮",
    "Keep exploring, quantum adventurer! 🚀",
    "Every measurement changes the system! 📊",
    "Wave functions are everywhere! 🌊"
  ];

  const handleCatClick = () => {
    const randomMessage = dialogMessages[Math.floor(Math.random() * dialogMessages.length)];
    setDialogText(randomMessage);
    setShowDialog(true);
    
    setTimeout(() => {
      setShowDialog(false);
    }, 3000);
  };

  return (
    <>
      {/* Companion Cat */}
      <motion.div
        className="fixed z-50 cursor-pointer select-none"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)'
        }}
        variants={catVariants}
        animate={isIdle ? 'idle' : 'walking'}
        whileHover="hover"
        onClick={handleCatClick}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ 
          opacity: 1, 
          scale: 1,
          transition: { ease: "easeInOut", duration: 0.5 }
        }}
      >
        <div className="relative">
          {/* Cat Emoji with enhanced size (160-200px as specified) */}
          <div className="text-[160px] md:text-[200px] filter drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
            🐱
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 text-[160px] md:text-[200px] animate-pulse opacity-30 blur-sm">
            🐱
          </div>
        </div>
      </motion.div>

      {/* Dialog Bubble */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            style={{
              left: position.x,
              top: position.y - 120 // Position above the cat
            }}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-2xl border border-gray-300 shadow-xl max-w-xs text-center relative transform -translate-x-1/2">
              {/* Speech bubble pointer */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/95"></div>
              
              <p className="text-sm font-medium">{dialogText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CompanionCat;