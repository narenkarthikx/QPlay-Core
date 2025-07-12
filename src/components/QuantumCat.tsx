import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, MessageCircle, Sparkles } from 'lucide-react';
import { quantumCatHints, getRandomQuote, getHintForLevel } from './QuantumCatHints';

interface QuantumCatProps {
  roomId: string;
  onHintUsed?: (level: number) => void;
}

const QuantumCat: React.FC<QuantumCatProps> = ({ roomId, onHintUsed }) => {
  const [currentHintLevel, setCurrentHintLevel] = useState<1 | 2 | 3>(1);
  const [showHint, setShowHint] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(0);
  const [catAnimation, setCatAnimation] = useState<'idle' | 'pacing' | 'sitting'>('idle');

  const config = quantumCatHints[roomId];
  const position = config?.position || 'bottom-left';

  // Cat animation cycle
  useEffect(() => {
    const animationInterval = setInterval(() => {
      const animations: Array<'idle' | 'pacing' | 'sitting'> = ['idle', 'pacing', 'sitting'];
      setCatAnimation(animations[Math.floor(Math.random() * animations.length)]);
    }, 5000);

    return () => clearInterval(animationInterval);
  }, []);

  // Auto-show random quote periodically
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      if (!showHint && !isHovering && Date.now() - lastInteraction > 30000) {
        const quote = getRandomQuote(roomId);
        setCurrentMessage(quote);
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
      }
    }, 60000); // Show quote every minute if no interaction

    return () => clearInterval(quoteInterval);
  }, [roomId, showHint, isHovering, lastInteraction]);

  const handleCatClick = () => {
    setLastInteraction(Date.now());
    const hint = getHintForLevel(roomId, currentHintLevel);
    setCurrentMessage(hint);
    setShowHint(true);
    
    // Progress to next hint level
    const nextLevel = currentHintLevel === 3 ? 1 : (currentHintLevel + 1) as 1 | 2 | 3;
    setCurrentHintLevel(nextLevel);
    
    // Callback for tracking hint usage
    onHintUsed?.(currentHintLevel);
    
    // Auto-hide after 6 seconds
    setTimeout(() => setShowHint(false), 6000);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setLastInteraction(Date.now());
    
    // Show a random quote on hover
    if (!showHint) {
      const quote = getRandomQuote(roomId);
      setCurrentMessage(quote);
      setShowHint(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Hide hint after a short delay
    setTimeout(() => {
      if (!isHovering) {
        setShowHint(false);
      }
    }, 2000);
  };

  const getCatEmoji = () => {
    switch (catAnimation) {
      case 'sitting': return '🐱';
      case 'pacing': return '🚶‍♂️🐾';
      case 'idle':
      default: return '😸';
    }
  };

  const getPositionClasses = () => {
    return position === 'bottom-left' 
      ? 'bottom-6 left-6' 
      : 'bottom-6 right-6';
  };

  const getTooltipClasses = () => {
    return position === 'bottom-left'
      ? 'bottom-full left-0 mb-3'
      : 'bottom-full right-0 mb-3';
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-40`}>
      {/* Hint Tooltip */}
      <AnimatePresence>
        {showHint && currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`absolute ${getTooltipClasses()} max-w-sm`}
          >
            <div className="bg-gray-900/95 backdrop-blur-sm border border-purple-500/50 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-200 leading-relaxed">{currentMessage}</p>
              </div>
              
              {/* Hint level indicator */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300">
                    Schrödinger's Cat
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`w-2 h-2 rounded-full ${
                        level === currentHintLevel
                          ? 'bg-purple-400'
                          : level < currentHintLevel
                          ? 'bg-purple-600'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div 
              className={`absolute top-full ${
                position === 'bottom-left' ? 'left-4' : 'right-4'
              } w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-purple-500/50`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat Character */}
      <motion.button
        onClick={handleCatClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Cat base */}
        <div className="relative">
          <motion.div
            animate={{
              x: catAnimation === 'pacing' ? [0, 10, 0] : 0,
              rotate: catAnimation === 'sitting' ? [0, -5, 5, 0] : 0,
            }}
            transition={{
              duration: catAnimation === 'pacing' ? 2 : 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border-2 border-purple-400/50 backdrop-blur-sm flex items-center justify-center text-2xl cursor-pointer hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-300 transition-all duration-300"
          >
            {getCatEmoji()}
          </motion.div>

          {/* Quantum sparkles around cat */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full opacity-60" />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-80" />
            <div className="absolute top-1 -left-2 w-1 h-1 bg-blue-400 rounded-full opacity-70" />
          </motion.div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/20 group-hover:to-pink-400/20 transition-all duration-300" />
        </div>

        {/* Help indicator */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs"
        >
          <HelpCircle className="w-2.5 h-2.5 text-yellow-900" />
        </motion.div>

        {/* Click ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-300"
          initial={{ scale: 1, opacity: 0 }}
          animate={isHovering ? { scale: 1.3, opacity: 0.3 } : { scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </motion.button>

      {/* Accessibility label */}
      <div className="sr-only">
        Schrödinger's Cat - Click for quantum hints and assistance
      </div>
    </div>
  );
};

export default QuantumCat;