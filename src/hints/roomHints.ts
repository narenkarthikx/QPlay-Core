// Modular Hint System for QPlay-Core
// Dynamic, config-driven hints for each room

export interface Hint {
  id: string;
  message: string;
  triggerCondition?: string;
  priority: number;
  repeatLimit?: number;
  category: 'tutorial' | 'strategy' | 'physics' | 'encouragement' | 'warning';
}

export interface RoomHints {
  roomId: string;
  roomName: string;
  hints: Hint[];
}

// Centralized hint data for all rooms
export const ROOM_HINTS: Record<string, RoomHints> = {
  'state-chamber': {
    roomId: 'state-chamber',
    roomName: 'State Chamber',
    hints: [
      {
        id: 'state-chamber-intro',
        message: '🔮 Welcome to the State Chamber! Your goal is to reconstruct the hidden quantum state by making strategic measurements.',
        category: 'tutorial',
        priority: 1,
        repeatLimit: 1
      },
      {
        id: 'state-chamber-measurement',
        message: '📏 Each axis measurement will show the hidden state component plus some noise. You get 3 measurements per axis - use them wisely!',
        category: 'strategy',
        priority: 2,
        triggerCondition: 'no_measurements'
      },
      {
        id: 'state-chamber-reconstruction',
        message: '🧮 Once you have measurements from all axes, click "Reconstruct Quantum State" to see your results on the Bloch sphere.',
        category: 'strategy',
        priority: 3,
        triggerCondition: 'has_measurements'
      },
      {
        id: 'state-chamber-decoherence',
        message: '⚠️ The state is showing decoherence! Adjust the noise filter to isolate the pure quantum state from environmental noise.',
        category: 'warning',
        priority: 4,
        triggerCondition: 'decoherence_detected'
      },
      {
        id: 'state-chamber-filter-tip',
        message: '💡 Pro tip: The noise filter works like a signal processor. Values closer to 1.0 preserve more of the signal, while lower values filter out noise.',
        category: 'strategy',
        priority: 5,
        triggerCondition: 'show_decoherence'
      },
      {
        id: 'state-chamber-physics',
        message: '🔬 In quantum mechanics, measurement disturbs the system. That\'s why you see noise - you\'re probing a delicate quantum superposition!',
        category: 'physics',
        priority: 6
      }
    ]
  },

  'superposition-tower': {
    roomId: 'superposition-tower',
    roomName: 'Superposition Tower',
    hints: [
      {
        id: 'superposition-intro',
        message: '🗼 Welcome to Superposition Tower! Create quantum bridges by applying Hadamard gates and walking only on superposition states.',
        category: 'tutorial',
        priority: 1,
        repeatLimit: 1
      },
      {
        id: 'superposition-hadamard',
        message: '⚡ Click the "H" buttons to apply Hadamard gates. This transforms classical states |0⟩ or |1⟩ into superposition (|0⟩ + |1⟩)/√2.',
        category: 'tutorial',
        priority: 2,
        triggerCondition: 'no_superposition'
      },
      {
        id: 'superposition-walking',
        message: '🚶‍♂️ You can only walk on purple superposition pads! Blue and red classical states will block your path.',
        category: 'strategy',
        priority: 3,
        triggerCondition: 'has_superposition'
      },
      {
        id: 'superposition-sequence',
        message: '🎯 Follow the exact sequence shown in the objective! Wrong steps cause destructive interference and decoherence.',
        category: 'warning',
        priority: 4,
        triggerCondition: 'wrong_sequence'
      },
      {
        id: 'superposition-interference',
        message: '🌊 Quantum interference is key! Constructive interference keeps your path stable, while destructive interference causes collapse.',
        category: 'physics',
        priority: 5,
        triggerCondition: 'interference_detected'
      },
      {
        id: 'superposition-encouragement',
        message: '💪 Don\'t give up! Each floor teaches you more about quantum superposition. You\'re mastering one of physics\' most beautiful concepts!',
        category: 'encouragement',
        priority: 6,
        triggerCondition: 'multiple_failures'
      }
    ]
  },

  'tunneling-vault': {
    roomId: 'tunneling-vault',
    roomName: 'Tunneling Vault',
    hints: [
      {
        id: 'tunneling-intro',
        message: '🏛️ Welcome to the Tunneling Vault! Use quantum tunneling to escape through an energy barrier that\'s classically impossible to cross.',
        category: 'tutorial',
        priority: 1,
        repeatLimit: 1
      },
      {
        id: 'tunneling-parameters',
        message: '🔧 Adjust the barrier height, width, and particle energy. Lower barriers and thinner walls dramatically increase tunneling probability!',
        category: 'strategy',
        priority: 2,
        triggerCondition: 'low_probability'
      },
      {
        id: 'tunneling-physics',
        message: '⚡ Tunneling probability follows T = e^(-2κa). Even small changes to parameters can exponentially improve your chances!',
        category: 'physics',
        priority: 3,
        triggerCondition: 'show_formula'
      },
      {
        id: 'tunneling-optimization',
        message: '🎯 Try the Auto-Optimize button if you\'re stuck! It demonstrates the sweet spot for maximum tunneling probability.',
        category: 'strategy',
        priority: 4,
        triggerCondition: 'multiple_failures'
      },
      {
        id: 'tunneling-quantum',
        message: '🌟 Remember: even 1% probability can succeed! Quantum mechanics is fundamentally probabilistic - embrace the uncertainty!',
        category: 'encouragement',
        priority: 5,
        triggerCondition: 'very_low_probability'
      }
    ]
  },

  'entanglement-bridge': {
    roomId: 'entanglement-bridge',
    roomName: 'Entanglement Bridge',
    hints: [
      {
        id: 'entanglement-intro',
        message: '🌉 Welcome to the Entanglement Bridge! Master quantum entanglement to create spooky action at a distance.',
        category: 'tutorial',
        priority: 1,
        repeatLimit: 1
      },
      {
        id: 'entanglement-pairs',
        message: '👥 Create entangled particle pairs. When you measure one particle, you instantly know the state of its partner, no matter the distance!',
        category: 'strategy',
        priority: 2
      },
      {
        id: 'entanglement-physics',
        message: '🔬 Einstein called it "spooky action at a distance" but quantum entanglement is real and fundamental to quantum mechanics!',
        category: 'physics',
        priority: 3
      }
    ]
  },

  'quantum-archive': {
    roomId: 'quantum-archive',
    roomName: 'Quantum Archive',
    hints: [
      {
        id: 'archive-intro',
        message: '🗂️ Welcome to the Quantum Archive! Connect quantum information using superposition principles.',
        category: 'tutorial',
        priority: 1,
        repeatLimit: 1
      },
      {
        id: 'archive-connections',
        message: '🔗 Look for patterns in quantum states. Similar superposition phases will resonate and create stable connections.',
        category: 'strategy',
        priority: 2
      },
      {
        id: 'archive-feedback',
        message: '💡 Pay attention to the visual feedback! Glowing connections indicate quantum resonance.',
        category: 'strategy',
        priority: 3,
        triggerCondition: 'wrong_connections'
      }
    ]
  },

  'probability-bay': {
    roomId: 'probability-bay',
    roomName: 'Probability Bay',
    hints: [
      {
        id: 'probability-intro',
        message: '🎲 Welcome to Probability Bay! Navigate quantum uncertainty using probability amplitude calculations.',
        category: 'tutorial',
        priority: 1,
        repeatLimit: 1
      },
      {
        id: 'probability-amplitudes',
        message: '📊 Remember: probability is the square of the amplitude! |ψ|² gives you the likelihood of measurement outcomes.',
        category: 'physics',
        priority: 2
      },
      {
        id: 'probability-strategy',
        message: '🎯 Look for paths with the highest probability amplitudes. These represent the most likely quantum outcomes.',
        category: 'strategy',
        priority: 3
      }
    ]
  }
};

// Utility functions for hint management
export const getHintsForRoom = (roomId: string): RoomHints | null => {
  return ROOM_HINTS[roomId] || null;
};

export const getHintById = (roomId: string, hintId: string): Hint | null => {
  const roomHints = getHintsForRoom(roomId);
  if (!roomHints) return null;
  
  return roomHints.hints.find(hint => hint.id === hintId) || null;
};

export const getHintsByCategory = (roomId: string, category: Hint['category']): Hint[] => {
  const roomHints = getHintsForRoom(roomId);
  if (!roomHints) return [];
  
  return roomHints.hints.filter(hint => hint.category === category);
};

export const getHintsByTrigger = (roomId: string, triggerCondition: string): Hint[] => {
  const roomHints = getHintsForRoom(roomId);
  if (!roomHints) return [];
  
  return roomHints.hints.filter(hint => hint.triggerCondition === triggerCondition);
};

export const getPriorityHints = (roomId: string, maxPriority: number = 3): Hint[] => {
  const roomHints = getHintsForRoom(roomId);
  if (!roomHints) return [];
  
  return roomHints.hints
    .filter(hint => hint.priority <= maxPriority)
    .sort((a, b) => a.priority - b.priority);
};

// Room configuration with dynamic target states
export interface RoomConfig {
  roomId: string;
  name: string;
  targetState?: {
    x: number;
    y: number;
    z: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  maxAttempts?: number;
}

export const ROOM_CONFIGS: Record<string, RoomConfig> = {
  'state-chamber': {
    roomId: 'state-chamber',
    name: 'State Chamber',
    targetState: {
      x: 0.6,
      y: 0.8,
      z: 0.2
    },
    difficulty: 'medium',
    timeLimit: 120
  },
  'superposition-tower': {
    roomId: 'superposition-tower',
    name: 'Superposition Tower',
    difficulty: 'hard',
    timeLimit: 180,
    maxAttempts: 5
  },
  'tunneling-vault': {
    roomId: 'tunneling-vault',
    name: 'Tunneling Vault',
    difficulty: 'hard',
    timeLimit: 60,
    maxAttempts: 10
  },
  'entanglement-bridge': {
    roomId: 'entanglement-bridge',
    name: 'Entanglement Bridge',
    difficulty: 'medium',
    timeLimit: 150
  },
  'quantum-archive': {
    roomId: 'quantum-archive',
    name: 'Quantum Archive',
    difficulty: 'easy',
    timeLimit: 90
  },
  'probability-bay': {
    roomId: 'probability-bay',
    name: 'Probability Bay',
    difficulty: 'medium',
    timeLimit: 100
  }
};

export const getRoomConfig = (roomId: string): RoomConfig | null => {
  return ROOM_CONFIGS[roomId] || null;
};

// Generate random target state for State Chamber (replacing hardcoded values)
export const generateRandomTargetState = () => {
  // Ensure the state is normalized and physically meaningful
  const theta = Math.random() * Math.PI; // 0 to π
  const phi = Math.random() * 2 * Math.PI; // 0 to 2π
  
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta)
  };
};

// Validate if target state is normalized (for physics correctness)
export const validateTargetState = (state: { x: number; y: number; z: number }): boolean => {
  const magnitude = Math.sqrt(state.x ** 2 + state.y ** 2 + state.z ** 2);
  return Math.abs(magnitude - 1.0) < 0.1; // Allow small tolerance
};