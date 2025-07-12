import React, { useState, useEffect } from 'react';
import { Zap, ArrowUp, ArrowDown, RefreshCw, Lightbulb, Eye, Target, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { usePlayerActivityContext } from '../../contexts/PlayerActivityContext';

interface QuantumPad {
  id: number;
  state: 'up' | 'down' | 'superposition';
  locked: boolean;
  glowing: boolean;
  phase: number; // For interference calculations
  amplitude: number;
}

interface PathSegment {
  from: number;
  to: number;
  stable: boolean;
}

const SuperpositionTower: React.FC = () => {
  const { completeRoom, logQuantumMeasurement } = useGame();
  const { markFailure, markSuccess } = usePlayerActivityContext();
  const [currentFloor, setCurrentFloor] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(2); // Middle position
  const [quantumPads, setQuantumPads] = useState<QuantumPad[]>([]);
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per floor
  const [gameStarted, setGameStarted] = useState(false);
  const [roomStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [lastError, setLastError] = useState('');
  const [pathStable, setPathStable] = useState(true);
  const [decoherenceTimer, setDecoherenceTimer] = useState(10);
  const [interferencePattern, setInterferencePattern] = useState<'constructive' | 'destructive' | 'none'>('none');
  const [quantumStateCollapsed, setQuantumStateCollapsed] = useState(false);
  const [showQuantumAnimation, setShowQuantumAnimation] = useState(false);

  // Floor patterns - each floor has a specific solution
  const floorPatterns = [
    { required: [2], description: "Create superposition in the center pad" },
    { required: [1, 3], description: "Two adjacent superposition states for constructive interference" },
    { required: [0, 2, 4], description: "Alternating pattern creates stable quantum bridge" },
    { required: [1, 2, 3], description: "Three consecutive pads form perfect interference pattern" },
    { required: [0, 1, 3, 4], description: "Four-pad configuration for maximum quantum coherence" }
  ];

  // Helper function to generate solvable initial states
  const generateSolvableState = (floorIndex: number): QuantumPad[] => {
    const pattern = floorPatterns[floorIndex];
    const newPads: QuantumPad[] = [];
    
    for (let i = 0; i < 5; i++) {
      const isRequired = pattern.required.includes(i);
      
      // For required pads, ensure they have compatible phases for constructive interference
      let phase = 0;
      if (isRequired && pattern.required.length > 1) {
        // Calculate phase to ensure constructive interference in sequence
        const sequenceIndex = pattern.required.indexOf(i);
        // Use phases that will result in constructive interference
        phase = (sequenceIndex * Math.PI / 4) % (2 * Math.PI);
      } else {
        // Non-required pads can have random phases
        phase = Math.random() * 2 * Math.PI;
      }
      
      newPads.push({
        id: i,
        state: Math.random() > 0.5 ? 'up' : 'down', // Start with classical states
        locked: false,
        glowing: isRequired && showHints,
        phase: phase,
        amplitude: 1.0
      });
    }
    
    return newPads;
  };

  // Function to validate if current state can reach the target pattern
  const isStateReachable = (pads: QuantumPad[], targetPattern: number[]): boolean => {
    // Check if we can create the required superposition states with constructive interference
    for (let i = 0; i < targetPattern.length - 1; i++) {
      const pad1Id = targetPattern[i];
      const pad2Id = targetPattern[i + 1];
      const pad1 = pads[pad1Id];
      const pad2 = pads[pad2Id];
      
      // Simulate what would happen if both pads were in superposition
      // Check if their phases would allow constructive interference
      const phaseDiff = Math.abs(pad1.phase - pad2.phase);
      const wouldHaveConstructiveInterference = 
        phaseDiff < Math.PI / 2 || phaseDiff > 3 * Math.PI / 2;
      
      if (!wouldHaveConstructiveInterference) {
        return false;
      }
    }
    return true;
  };

  // Generate a deterministic solvable state as fallback
  const generateDeterministicSolvableState = (floorIndex: number): QuantumPad[] => {
    const pattern = floorPatterns[floorIndex];
    const newPads: QuantumPad[] = [];
    
    for (let i = 0; i < 5; i++) {
      const isRequired = pattern.required.includes(i);
      
      newPads.push({
        id: i,
        state: i % 2 === 0 ? 'up' : 'down', // Alternating pattern for determinism
        locked: false,
        glowing: isRequired && showHints,
        phase: isRequired ? 0 : Math.PI / 4, // Ensure constructive interference for required pads
        amplitude: 1.0
      });
    }
    
    return newPads;
  };

  // Check if current pad configuration makes the level impossible
  const checkForImpossibleState = (): boolean => {
    const pattern = floorPatterns[currentFloor];
    return !isStateReachable(quantumPads, pattern.required);
  };

  // Enhanced error feedback with impossible state detection
  const handleImpossibleState = () => {
    setLastError('⚠️ Current configuration detected as impossible! The quantum phases prevent the required interference pattern. Generating new solvable state...');
    setTimeout(() => {
      resetPath();
    }, 2000);
  };

  // Initialize quantum pads for current floor
  useEffect(() => {
    let newPads: QuantumPad[];
    const pattern = floorPatterns[currentFloor];
    let attempts = 0;
    const maxAttempts = 10;
    
    // Try to generate a solvable state, with fallback to guaranteed solvable configuration
    do {
      newPads = generateSolvableState(currentFloor);
      attempts++;
    } while (!isStateReachable(newPads, pattern.required) && attempts < maxAttempts);
    
    // If we couldn't generate a random solvable state, use a deterministic one
    if (attempts >= maxAttempts) {
      console.warn(`Could not generate random solvable state for floor ${currentFloor + 1}, using deterministic configuration`);
      newPads = generateDeterministicSolvableState(currentFloor);
    }
    
    setQuantumPads(newPads);
    setSelectedPath([]);
    setPathSegments([]);
    setPlayerPosition(2);
    setLastError('');
    setPathStable(true);
    setDecoherenceTimer(10);
    setInterferencePattern('none');
    setQuantumStateCollapsed(false);
  }, [currentFloor, showHints]);

  // Timer countdown
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !roomCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      triggerDecoherence("Time's up! Quantum state collapsed due to environmental decoherence.");
    }
  }, [gameStarted, timeLeft, roomCompleted]);

  // Decoherence timer when path is unstable
  useEffect(() => {
    if (!pathStable && decoherenceTimer > 0) {
      const timer = setTimeout(() => {
        setDecoherenceTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (decoherenceTimer === 0 && !pathStable) {
      triggerDecoherence("Decoherence complete! Quantum superposition collapsed.");
    }
  }, [pathStable, decoherenceTimer]);

  const startGame = () => {
    setGameStarted(true);
    setShowTutorial(false);
    setTimeLeft(180);
  };

  const applyHadamardGate = (padId: number) => {
    if (quantumPads[padId].locked || quantumStateCollapsed) return;
    
    setShowQuantumAnimation(true);
    setTimeout(() => setShowQuantumAnimation(false), 1000);
    
    setQuantumPads(prev => prev.map(pad => {
      if (pad.id === padId) {
        let newState: 'up' | 'down' | 'superposition';
        let newPhase = pad.phase;
        let newAmplitude = pad.amplitude;
        
        if (pad.state === 'up') {
          // |0⟩ → (|0⟩ + |1⟩)/√2
          newState = 'superposition';
          newPhase = 0; // In-phase superposition
          newAmplitude = 1 / Math.sqrt(2);
        } else if (pad.state === 'down') {
          // |1⟩ → (|0⟩ - |1⟩)/√2
          newState = 'superposition';
          newPhase = Math.PI; // Out-of-phase superposition
          newAmplitude = 1 / Math.sqrt(2);
        } else {
          // Superposition → random classical state (measurement)
          newState = Math.random() > 0.5 ? 'up' : 'down';
          newPhase = 0;
          newAmplitude = 1.0;
        }
        
        return { ...pad, state: newState, phase: newPhase, amplitude: newAmplitude };
      }
      return pad;
    }));

    // Update quantum clue board
    if (quantumPads[padId].state !== 'superposition') {
      setLastError(`✨ Hadamard transformation applied to Pad ${padId + 1}! Quantum superposition created.`);
    } else {
      setLastError(`📏 Quantum measurement performed on Pad ${padId + 1}! Superposition collapsed to classical state.`);
    }
  };

  const stepOnPad = async (padId: number) => {
    if (quantumStateCollapsed) return;
    
    const pad = quantumPads[padId];
    const pattern = floorPatterns[currentFloor];
    
    // Log quantum interaction
    await logQuantumMeasurement('superposition-tower', 'pad_interaction', {
      pad_id: padId,
      pad_state: pad.state,
      floor: currentFloor,
      player_position: playerPosition,
      timestamp: new Date().toISOString()
    });
    
    // Check if pad is in superposition
    if (pad.state !== 'superposition') {
      triggerDecoherence(`❌ Cannot step on classical state! Pad ${padId + 1} is in ${pad.state === 'up' ? '|0⟩' : '|1⟩'} state. Only superposition states can support quantum tunneling.`);
      setAttempts(prev => prev + 1);
      return;
    }

    // Check if this pad is part of the correct pattern
    if (!pattern.required.includes(padId)) {
      triggerDecoherence(`❌ Wrong quantum path! Stepping on Pad ${padId + 1} creates destructive interference. The quantum bridge collapses!`);
      return;
    }

    // Check if this is the next correct step in sequence
    const nextRequiredPad = pattern.required[selectedPath.length];
    if (padId !== nextRequiredPad) {
      triggerDecoherence(`❌ Incorrect sequence! You must step on Pad ${nextRequiredPad + 1} next to maintain quantum coherence.`);
      return;
    }

    // Successful step!
    const newPath = [...selectedPath, padId];
    setSelectedPath(newPath);
    setPlayerPosition(padId);
    setLastError('');
    
    // Lock the pad and create path segment
    setQuantumPads(prev => prev.map(pad => 
      pad.id === padId ? { ...pad, locked: true } : pad
    ));

    // Add path segment with interference calculation
    if (selectedPath.length > 0) {
      const lastPad = selectedPath[selectedPath.length - 1];
      const interference = calculateInterference(lastPad, padId);
      setPathSegments(prev => [...prev, { from: lastPad, to: padId, stable: interference === 'constructive' }]);
      setInterferencePattern(interference);
    }

    // Check for constructive interference
    if (newPath.length >= 2) {
      const hasConstructiveInterference = checkConstructiveInterference(newPath);
      if (!hasConstructiveInterference) {
        setPathStable(false);
        setDecoherenceTimer(10);
        setLastError('⚠️ Quantum path unstable! Destructive interference detected. Decoherence timer started!');
      } else {
        setLastError(`✅ Constructive interference achieved! Quantum bridge segment ${newPath.length}/${pattern.required.length} stable.`);
      }
    }

    // Check if floor is complete
    if (newPath.length === pattern.required.length) {
      setTimeout(() => {
        setLastError(`🎉 Floor ${currentFloor + 1} completed! Perfect quantum interference pattern achieved.`);
        if (currentFloor < 4) {
          setTimeout(() => {
            setCurrentFloor(prev => prev + 1);
            setTimeLeft(180); // Reset timer for next floor
          }, 2000);
        } else {
          setTimeout(async () => {
            setRoomCompleted(true);
            markSuccess(); // Trigger cat celebration
            
            // Calculate completion metrics
            const completionTime = Date.now() - roomStartTime;
            const score = Math.max(1500 - (attempts * 50) - Math.floor(completionTime / 1000), 200);
            
            // Log final quantum state measurement
            await logQuantumMeasurement('superposition-tower', 'tower_completion', {
              floors_completed: 5,
              final_path: selectedPath,
              completion_time: completionTime,
              total_attempts: attempts
            });
            
            // Complete room with metrics
            await completeRoom('superposition-tower', {
              time: completionTime,
              attempts: attempts,
              score: score
            });
          }, 2000);
        }
      }, 1000);
    }
  };

  const calculateInterference = (pad1: number, pad2: number): 'constructive' | 'destructive' => {
    const phase1 = quantumPads[pad1]?.phase || 0;
    const phase2 = quantumPads[pad2]?.phase || 0;
    const phaseDifference = Math.abs(phase1 - phase2);
    
    // Constructive if phases are similar (within π/2)
    return phaseDifference < Math.PI / 2 || phaseDifference > 3 * Math.PI / 2 ? 'constructive' : 'destructive';
  };

  const checkConstructiveInterference = (path: number[]): boolean => {
    if (path.length < 2) return true;
    
    // Check all adjacent pairs in the path
    for (let i = 0; i < path.length - 1; i++) {
      const interference = calculateInterference(path[i], path[i + 1]);
      if (interference === 'destructive') return false;
    }
    return true;
  };

  const triggerDecoherence = (message: string) => {
    setQuantumStateCollapsed(true);
    setPathStable(false);
    setLastError(message);
    setAttempts(prev => prev + 1);
    markFailure(); // Trigger cat failure reaction
    
    // Reset after showing decoherence effect
    setTimeout(() => {
      resetPath();
    }, 3000);
  };

  const resetPath = () => {
    setSelectedPath([]);
    setPathSegments([]);
    setPlayerPosition(2);
    setPathStable(true);
    setDecoherenceTimer(10);
    setInterferencePattern('none');
    setQuantumStateCollapsed(false);
    setLastError('🔄 Quantum system reset with guaranteed solvable configuration.');
    
    // Generate a new solvable state instead of completely random
    const pattern = floorPatterns[currentFloor];
    let newPads: QuantumPad[];
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
      newPads = generateSolvableState(currentFloor);
      attempts++;
    } while (!isStateReachable(newPads, pattern.required) && attempts < maxAttempts);
    
    // If we couldn't generate a random solvable state, use a deterministic one
    if (attempts >= maxAttempts) {
      newPads = generateDeterministicSolvableState(currentFloor);
    }
    
    setQuantumPads(newPads);
  };

  const getPadColor = (pad: QuantumPad) => {
    if (quantumStateCollapsed) {
      return 'from-red-600 to-red-800 animate-pulse';
    }
    if (pad.locked) {
      return 'from-green-500 to-emerald-500';
    }
    if (pad.glowing && showHints && pad.state !== 'superposition') {
      return 'from-yellow-400 to-orange-400 animate-pulse';
    }
    
    switch (pad.state) {
      case 'up':
        return 'from-blue-500 to-blue-600';
      case 'down':
        return 'from-red-500 to-red-600';
      case 'superposition':
        return 'from-purple-500 to-pink-500 animate-pulse';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPadIcon = (state: string) => {
    switch (state) {
      case 'up':
        return <ArrowUp className="w-6 h-6" />;
      case 'down':
        return <ArrowDown className="w-6 h-6" />;
      case 'superposition':
        return <RefreshCw className="w-6 h-6 animate-spin" />;
      default:
        return null;
    }
  };

  const getFloorHint = () => {
    return floorPatterns[currentFloor].description;
  };

  const getQuantumStateLabel = (state: string) => {
    switch (state) {
      case 'up': return '|0⟩';
      case 'down': return '|1⟩';
      case 'superposition': return '(|0⟩ + |1⟩)/√2';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🗼</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            SUPERPOSITION TOWER
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Master quantum superposition and wave interference to escape the tower. Create stable quantum bridges 
            by applying Hadamard transformations and stepping only on superposition states that exhibit constructive interference.
          </p>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 rounded-2xl border border-green-500 max-w-3xl w-full p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎓</div>
                <h2 className="text-2xl font-bold text-green-400 mb-4">Quantum Superposition Tutorial</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-2">🔬 The Science</h3>
                  <p className="text-green-200 text-sm">
                    Quantum superposition allows particles to exist in multiple states simultaneously. The Hadamard gate 
                    creates superposition: H|0⟩ = (|0⟩ + |1⟩)/√2. When superposition states interfere constructively, 
                    they create stable quantum bridges. Destructive interference causes decoherence and collapse.
                  </p>
                </div>
                
                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">🎮 Step-by-Step Process</h3>
                  <ol className="text-purple-200 text-sm space-y-1 list-decimal list-inside">
                    <li>Apply Hadamard gates (H) to transform classical states into superposition</li>
                    <li>Step only on superposition pads - they glow when part of the correct pattern</li>
                    <li>Follow the exact sequence to maintain quantum coherence</li>
                    <li>Watch for constructive interference - wrong steps cause decoherence</li>
                    <li>Complete the pattern to advance to the next floor</li>
                  </ol>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">⚠️ Decoherence Warning</h3>
                  <p className="text-blue-200 text-sm">
                    Wrong steps trigger decoherence - the quantum state becomes unstable and you have 10 seconds 
                    before complete collapse. Environmental factors and measurement errors destroy superposition!
                  </p>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 
                         hover:from-green-400 hover:to-emerald-400 rounded-xl font-semibold text-lg 
                         transition-all duration-300 transform hover:scale-105"
              >
                Begin Quantum Escape!
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quantum Control Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-yellow-400" />
              Quantum Control Panel
            </h2>
            
            {/* Floor Progress */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Floor {currentFloor + 1}/5</span>
                <div className="flex items-center text-orange-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentFloor + 1) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Decoherence Warning */}
            {!pathStable && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-xl animate-pulse">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-300 font-semibold">DECOHERENCE WARNING</span>
                </div>
                <p className="text-red-200 text-sm mb-2">
                  Quantum state unstable! System collapse in: {decoherenceTimer}s
                </p>
                <div className="w-full bg-red-800 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(decoherenceTimer / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Current Objective */}
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
              <h3 className="font-semibold text-green-300 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Floor {currentFloor + 1} Objective
              </h3>
              <p className="text-green-200 text-sm mb-2">
                {getFloorHint()}
              </p>
              <div className="text-xs text-green-400">
                Required sequence: {floorPatterns[currentFloor].required.map(p => `Pad ${p + 1}`).join(' → ')}
              </div>
            </div>

            {/* Quantum State Information */}
            <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500 rounded-xl">
              <h3 className="font-semibold text-purple-300 mb-2">Quantum State Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Superposition pads:</span>
                  <span className="text-purple-400">{quantumPads.filter(p => p.state === 'superposition').length}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Path coherence:</span>
                  <span className={pathStable ? 'text-green-400' : 'text-red-400'}>
                    {pathStable ? 'Stable' : 'Unstable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interference:</span>
                  <span className={
                    interferencePattern === 'constructive' ? 'text-green-400' :
                    interferencePattern === 'destructive' ? 'text-red-400' : 'text-gray-400'
                  }>
                    {interferencePattern === 'none' ? 'None' : interferencePattern}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>State solvability:</span>
                  <span className={isStateReachable(quantumPads, floorPatterns[currentFloor].required) ? 'text-green-400' : 'text-red-400'}>
                    {isStateReachable(quantumPads, floorPatterns[currentFloor].required) ? 'Solvable' : 'Impossible'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total attempts:</span>
                  <span className="text-gray-400">{attempts}</span>
                </div>
              </div>
            </div>

            {/* Impossible State Warning */}
            {checkForImpossibleState() && (
              <div className="mb-6 p-4 bg-orange-900/30 border border-orange-500 rounded-xl">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
                  <span className="text-orange-300 font-semibold">IMPOSSIBLE STATE DETECTED</span>
                </div>
                <p className="text-orange-200 text-sm mb-3">
                  The current quantum phase configuration makes the required interference pattern impossible. 
                  The system needs to be reset to a solvable state.
                </p>
                <button
                  onClick={handleImpossibleState}
                  className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg 
                           font-semibold transition-all duration-300 text-sm"
                >
                  Generate Solvable State
                </button>
              </div>
            )}

            {/* Hint System */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                  Quantum Hints
                </h3>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    showHints ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  <span>(|0⟩ + |1⟩)/√2 - Superposition (walkable)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowUp className="w-4 h-4 text-blue-400" />
                  <span>|0⟩ - Spin up (blocked)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowDown className="w-4 h-4 text-red-400" />
                  <span>|1⟩ - Spin down (blocked)</span>
                </div>
                {showHints && (
                  <div className="text-yellow-400 text-xs mt-2 p-2 bg-yellow-900/20 rounded">
                    💡 Glowing pads show where superposition is needed!
                  </div>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetPath}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl 
                       font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Solvable State</span>
            </button>
          </div>

          {/* Tower Visualization */}
          <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Quantum Bridge Platform</h2>
              <div className="text-sm text-gray-400">
                Progress: {selectedPath.length}/{floorPatterns[currentFloor].required.length} pads
              </div>
            </div>

            {/* Error/Success Messages */}
            {lastError && (
              <div className={`mb-6 p-4 rounded-xl border ${
                lastError.includes('❌') || lastError.includes('⚠️') ? 'bg-red-900/30 border-red-500' :
                lastError.includes('✅') || lastError.includes('🎉') ? 'bg-green-900/30 border-green-500' :
                lastError.includes('✨') ? 'bg-purple-900/30 border-purple-500' :
                'bg-blue-900/30 border-blue-500'
              }`}>
                <p className={`text-sm font-medium ${
                  lastError.includes('❌') || lastError.includes('⚠️') ? 'text-red-300' :
                  lastError.includes('✅') || lastError.includes('🎉') ? 'text-green-300' :
                  lastError.includes('✨') ? 'text-purple-300' :
                  'text-blue-300'
                }`}>
                  {lastError}
                </p>
              </div>
            )}

            {/* Quantum Pads Grid */}
            <div className="relative mb-8">
              <div className="grid grid-cols-5 gap-4 mb-8">
                {quantumPads.map((pad) => (
                  <div key={pad.id} className="relative">
                    {/* Quantum Pad */}
                    <button
                      onClick={() => stepOnPad(pad.id)}
                      disabled={pad.locked || pad.state !== 'superposition' || quantumStateCollapsed}
                      className={`w-full h-24 rounded-xl bg-gradient-to-br ${getPadColor(pad)} 
                               hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center
                               disabled:cursor-not-allowed relative overflow-hidden border-2
                               ${playerPosition === pad.id ? 'border-yellow-400 ring-4 ring-yellow-400/50' : 'border-transparent'}
                               ${pad.locked ? 'ring-4 ring-green-400/50' : ''}
                               ${quantumStateCollapsed ? 'animate-pulse' : ''}`}
                    >
                      {getPadIcon(pad.state)}
                      
                      {/* Quantum State Label */}
                      <div className="text-xs font-mono mt-1 text-white/80">
                        {getQuantumStateLabel(pad.state)}
                      </div>
                      
                      {/* Quantum Animation Effects */}
                      {pad.state === 'superposition' && !pad.locked && !quantumStateCollapsed && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                       animate-pulse"></div>
                      )}
                      
                      {/* Success Checkmark */}
                      {pad.locked && (
                        <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full 
                                       flex items-center justify-center text-white text-xs">
                          ✓
                        </div>
                      )}

                      {/* Decoherence Effect */}
                      {quantumStateCollapsed && (
                        <div className="absolute inset-0 bg-red-500/50 animate-pulse flex items-center justify-center">
                          <span className="text-white font-bold text-xs">COLLAPSED</span>
                        </div>
                      )}
                    </button>
                    
                    {/* Hadamard Gate Button */}
                    <button
                      onClick={() => applyHadamardGate(pad.id)}
                      disabled={pad.locked || quantumStateCollapsed}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 hover:bg-purple-400 
                               disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm 
                               flex items-center justify-center transition-all duration-200 font-bold
                               border-2 border-white shadow-lg"
                      title={`Apply Hadamard Gate to Pad ${pad.id + 1}`}
                    >
                      H
                    </button>
                    
                    {/* Pad Label */}
                    <div className="text-center mt-2 text-sm text-gray-400">
                      Pad {pad.id + 1}
                    </div>

                    {/* Phase Indicator */}
                    {pad.state === 'superposition' && (
                      <div className="text-center mt-1 text-xs text-purple-400">
                        φ = {(pad.phase / Math.PI).toFixed(1)}π
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quantum Path Visualization */}
              {pathSegments.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    {pathSegments.map((segment, index) => {
                      const fromX = (segment.from % 5) * 20 + 10;
                      const fromY = 50;
                      const toX = (segment.to % 5) * 20 + 10;
                      const toY = 50;
                      
                      return (
                        <line
                          key={index}
                          x1={`${fromX}%`}
                          y1={`${fromY}%`}
                          x2={`${toX}%`}
                          y2={`${toY}%`}
                          stroke={segment.stable ? '#10b981' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={segment.stable ? '0' : '5,5'}
                          className={segment.stable ? '' : 'animate-pulse'}
                        />
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Player Avatar */}
              <div className="text-center mb-6">
                <div className={`inline-block w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 
                               rounded-full flex items-center justify-center text-2xl transition-all duration-300
                               ${quantumStateCollapsed ? 'animate-bounce' : 'animate-pulse'}`}>
                  🧑‍🚀
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Quantum Explorer (Position: Pad {playerPosition + 1})
                </p>
              </div>

              {/* Path Progress Display */}
              {selectedPath.length > 0 && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                  <h3 className="font-semibold mb-2 text-green-300 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Quantum Bridge Progress:
                  </h3>
                  <div className="flex items-center space-x-2 flex-wrap mb-2">
                    {selectedPath.map((padId, index) => (
                      <React.Fragment key={padId}>
                        <div className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                          Pad {padId + 1}
                        </div>
                        {index < selectedPath.length - 1 && (
                          <div className="text-green-400">→</div>
                        )}
                      </React.Fragment>
                    ))}
                    {selectedPath.length < floorPatterns[currentFloor].required.length && (
                      <>
                        <div className="text-green-400">→</div>
                        <div className="px-3 py-1 bg-gray-600 rounded-full text-sm">
                          Pad {floorPatterns[currentFloor].required[selectedPath.length] + 1}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-green-400">
                      ✓ Quantum Coherence: {selectedPath.length}/{floorPatterns[currentFloor].required.length}
                    </div>
                    <div className={pathStable ? 'text-green-400' : 'text-red-400'}>
                      {pathStable ? '✓ Constructive Interference' : '✗ Destructive Interference'}
                    </div>
                  </div>
                </div>
              )}

              {/* Room Completion */}
              {roomCompleted && (
                <div className="mt-6 p-6 bg-green-900/30 border border-green-500 rounded-xl text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-green-300 font-semibold text-xl mb-2">Superposition Tower Conquered!</p>
                  <p className="text-green-200 text-sm mb-4">
                    Extraordinary! You've mastered the quantum art of superposition and wave interference. 
                    You've proven that quantum mechanics allows for paths that classical physics would 
                    consider impossible. The tower's quantum locks have been permanently disabled!
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-800/30 p-3 rounded-lg">
                      <div className="font-semibold text-green-300">Total Attempts:</div>
                      <div className="text-green-200">{attempts}</div>
                    </div>
                    <div className="bg-green-800/30 p-3 rounded-lg">
                      <div className="font-semibold text-green-300">Final Time:</div>
                      <div className="text-green-200">{Math.floor((180 - timeLeft) / 60)}:{((180 - timeLeft) % 60).toString().padStart(2, '0')}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-green-400 text-sm">
                    🏆 Achievement Unlocked: Superposition Walker
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperpositionTower;