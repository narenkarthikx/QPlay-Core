import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Box } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { MessageSquare, X, Lightbulb } from 'lucide-react';
import { getHintsForRoom, getPriorityHints, Hint } from '../hints/roomHints';

interface AICompanionProps {
  roomId: string;
  position?: [number, number, number];
  scale?: number;
  triggerCondition?: string;
  onHintShown?: (hint: Hint) => void;
}

// 3D Bot Model Component
const BotModel: React.FC<{ onClick: () => void; isActive: boolean }> = ({ onClick, isActive }) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Gentle hover effects
      if (hovered) {
        groupRef.current.scale.setScalar(1.1 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
      } else {
        groupRef.current.scale.setScalar(1.0);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      style={{ cursor: hovered ? 'pointer' : 'default' }}
    >
      {/* Bot body - sphere */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={isActive ? '#8b5cf6' : hovered ? '#a855f7' : '#6366f1'} 
          emissive={isActive ? '#4c1d95' : hovered ? '#581c87' : '#312e81'}
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      {/* Bot eyes */}
      <Sphere args={[0.05, 8, 8]} position={[-0.1, 0.1, 0.25]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      <Sphere args={[0.05, 8, 8]} position={[0.1, 0.1, 0.25]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      
      {/* Bot pupils */}
      <Sphere args={[0.02, 4, 4]} position={[-0.1, 0.1, 0.27]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.02, 4, 4]} position={[0.1, 0.1, 0.27]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Bot antenna */}
      <Box args={[0.02, 0.3, 0.02]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color="#fbbf24" />
      </Box>
      
      {/* Antenna tip */}
      <Sphere args={[0.04, 8, 8]} position={[0, 0.6, 0]}>
        <meshStandardMaterial 
          color="#f59e0b" 
          emissive="#f59e0b"
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </Sphere>
      
      {/* Hint indicator ring */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <ringGeometry args={[0.4, 0.45, 32]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            transparent 
            opacity={0.6}
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
      
      {/* Floating quantum text */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.1}
        color={hovered ? "#a855f7" : "#6366f1"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        Q-Assistant
      </Text>
    </group>
  );
};

// Hint Popup Component
const HintPopup: React.FC<{ 
  hint: Hint | null; 
  onClose: () => void; 
  isVisible: boolean;
  position: { x: number; y: number };
}> = ({ hint, onClose, isVisible, position }) => {
  if (!isVisible || !hint) return null;

  const getCategoryIcon = (category: Hint['category']) => {
    switch (category) {
      case 'tutorial': return '🎓';
      case 'strategy': return '🎯';
      case 'physics': return '🔬';
      case 'encouragement': return '💪';
      case 'warning': return '⚠️';
      default: return '💡';
    }
  };

  const getCategoryColor = (category: Hint['category']) => {
    switch (category) {
      case 'tutorial': return 'from-blue-500 to-cyan-500';
      case 'strategy': return 'from-green-500 to-emerald-500';
      case 'physics': return 'from-purple-500 to-violet-500';
      case 'encouragement': return 'from-yellow-500 to-orange-500';
      case 'warning': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div 
      className="fixed z-50 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className={`
        max-w-sm p-4 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-600
        shadow-2xl transform transition-all duration-300 ease-out
        ${isVisible ? 'animate-in slide-in-from-bottom-2 fade-in' : 'animate-out slide-out-to-bottom-2 fade-out'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getCategoryColor(hint.category)} 
                           flex items-center justify-center text-sm font-bold text-white`}>
              {getCategoryIcon(hint.category)}
            </div>
            <div className="text-sm font-semibold text-gray-200 capitalize">
              {hint.category} Hint
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="text-sm text-gray-100 leading-relaxed mb-3">
          {hint.message}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Lightbulb className="w-3 h-3" />
            <span>Q-Assistant</span>
          </div>
          <div>Priority: {hint.priority}</div>
        </div>
        
        {/* Pointer arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
        </div>
      </div>
    </div>
  );
};

// Main AI Companion Component
const AICompanion: React.FC<AICompanionProps> = ({ 
  roomId, 
  position = [3, 2, 0], 
  scale = 1,
  triggerCondition,
  onHintShown 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [shownHints, setShownHints] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get hints for the current room
  const roomHints = getHintsForRoom(roomId);
  const priorityHints = getPriorityHints(roomId, 3);

  // Auto-show introduction hint
  useEffect(() => {
    if (roomHints && priorityHints.length > 0) {
      const introHint = priorityHints.find(hint => hint.priority === 1);
      if (introHint && !shownHints.has(introHint.id)) {
        setTimeout(() => {
          showHint(introHint);
        }, 1000); // Show after 1 second
      }
    }
  }, [roomId, roomHints]);

  // Handle trigger conditions
  useEffect(() => {
    if (triggerCondition && roomHints) {
      const triggeredHints = roomHints.hints.filter(hint => 
        hint.triggerCondition === triggerCondition && 
        !shownHints.has(hint.id)
      );
      
      if (triggeredHints.length > 0) {
        // Show the highest priority triggered hint
        const highestPriorityHint = triggeredHints.sort((a, b) => a.priority - b.priority)[0];
        showHint(highestPriorityHint);
      }
    }
  }, [triggerCondition, roomHints]);

  const showHint = (hint: Hint) => {
    if (hint.repeatLimit && shownHints.has(hint.id)) {
      return; // Don't show if repeat limit is set and already shown
    }

    setCurrentHint(hint);
    setIsActive(true);
    
    // Calculate popup position relative to canvas
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + 50
      });
    }
    
    setShowPopup(true);
    setShownHints(prev => new Set([...prev, hint.id]));
    
    if (onHintShown) {
      onHintShown(hint);
    }
  };

  const handleBotClick = () => {
    if (showPopup) {
      closePopup();
      return;
    }

    if (!roomHints) return;

    // Find next unshown hint
    const unshownHints = roomHints.hints.filter(hint => !shownHints.has(hint.id));
    
    if (unshownHints.length > 0) {
      // Show highest priority unshown hint
      const nextHint = unshownHints.sort((a, b) => a.priority - b.priority)[0];
      showHint(nextHint);
    } else {
      // Show a random hint if all have been shown
      const randomHint = roomHints.hints[Math.floor(Math.random() * roomHints.hints.length)];
      showHint(randomHint);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => {
      setIsActive(false);
      setCurrentHint(null);
    }, 300);
  };

  if (!roomHints) {
    return null; // Don't render if no hints available for this room
  }

  return (
    <>
      {/* 3D Canvas for the Bot */}
      <div 
        ref={canvasRef}
        className="fixed top-4 right-4 w-32 h-32 pointer-events-auto z-40"
        style={{ transform: `scale(${scale})` }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
          
          <group position={position}>
            <BotModel onClick={handleBotClick} isActive={isActive} />
          </group>
        </Canvas>
        
        {/* Interaction hint */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200">
            Click for hints!
          </div>
        </div>
      </div>

      {/* Hint Popup */}
      <HintPopup
        hint={currentHint}
        onClose={closePopup}
        isVisible={showPopup}
        position={popupPosition}
      />

      {/* Available hints indicator */}
      {roomHints && roomHints.hints.length > shownHints.size && (
        <div className="fixed top-4 right-40 z-30 pointer-events-none">
          <div className="flex items-center space-x-2 bg-purple-900/80 text-purple-200 px-3 py-1 rounded-full text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>{roomHints.hints.length - shownHints.size} hints available</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AICompanion;