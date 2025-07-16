import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Compass, Zap, Timer, AlertTriangle, Target, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CatReactionTriggers } from '../../types/game';
import { roomLogicEngine } from '../../services/RoomLogicEngine';
import { motion, AnimatePresence } from 'framer-motion';

// Add global type declarations for Blochy libraries
declare global {
  interface Window {
    Plotly: any;
    math: any;
    gen_bloch_sphere: () => any;
    update_state_plot: (redraw: boolean) => void;
    rotate_state: (axis: string, angle: number) => void;
    STATE: any[];
    BLOCHSPHERE: any;
    PHOSPHOR_ENABLED: boolean;
    PHOSPHOR: any[];
  }
}

interface BlochVector {
  x: number;
  y: number;
  z: number;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

interface StateChambrerProps {
  catReactionTriggers?: CatReactionTriggers;
}

const StateChambrer: React.FC<StateChambrerProps> = ({ catReactionTriggers }) => {
  const { completeRoom } = useGame();
  const [measurements, setMeasurements] = useState({ x: 0, y: 0, z: 0 });
  const [measurementCount, setMeasurementCount] = useState({ x: 0, y: 0, z: 0 });
  const [reconstructedState, setReconstructedState] = useState<BlochVector>({ x: 0, y: 0, z: 0 });
  const [decoherenceLevel, setDecoherenceLevel] = useState(0.8);
  const [noiseFilter, setNoiseFilter] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  
  // Enhanced learning state with RoomLogicEngine  
  const [showConceptIntro, setShowConceptIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const [conceptsLearned, setConceptsLearned] = useState<string[]>([]);
  const [needsHint, setNeedsHint] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [showDecoherence, setShowDecoherence] = useState(false);
  const [isFilterApplying, setIsFilterApplying] = useState(false);
  const blochSphereRef = useRef<HTMLDivElement>(null);
  const [blochSphereLoaded, setBlochSphereLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Enhanced slider performance state
  const sliderRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  // Hidden target state (players need to reconstruct this)
  const targetState: BlochVector = { x: 0.6, y: 0.8, z: 0.2 };

  // Memoized debounce function to prevent recreation
  const stableDebounce = useMemo(
    () => debounce((value: number) => {
      setNoiseFilter(value);
    }, 16), // ~60fps updates
    []
  );

  // Optimized input handler with direct DOM manipulation
  const handleSliderInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    
    // Use requestAnimationFrame for smooth visual updates
    requestAnimationFrame(() => {
      // Direct DOM manipulation for immediate visual feedback
      if (progressRef.current) {
        progressRef.current.style.width = `${value * 100}%`;
      }
      
      // Update display value immediately for UI feedback
      setDisplayValue(value);
    });
    
    // Debounced state update for React logic
    stableDebounce(value);
  }, [stableDebounce]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);
  
  // Load Blochy scripts and initialize Bloch sphere with proper error handling
  useEffect(() => {
    // Initialize room logic engine
    roomLogicEngine.initializeRoom('state-chamber');
    // Trigger cat entry reaction
    catReactionTriggers?.onRoomAction?.('room-entered');
    
    const loadScripts = async () => {
      try {
        // Add CSS for zero-lag slider first
        const style = document.createElement('style');
        style.textContent = `
          .slider-no-lag {
            outline: none;
            background: transparent;
            margin: 0;
            padding: 0;
          }

          .slider-no-lag::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: none !important;
            transform: none !important;
          }

          .slider-no-lag::-webkit-slider-thumb:hover {
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
          }

          .slider-no-lag::-webkit-slider-thumb:active {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .slider-no-lag::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: none !important;
          }

          .slider-no-lag::-moz-range-track {
            background: transparent;
            border: none;
            height: 2px;
          }

          .slider-no-lag,
          .slider-no-lag * {
            transition: none !important;
            animation-duration: 0s !important;
          }
        `;
        document.head.appendChild(style);

        // Load required scripts with better error handling
      const scripts = [
  '/Blochy-main/plotly-2.16.1.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.2.1/math.js',
  '/Blochy-main/helper.js',
  '/Blochy-main/quantum.js',
  '/Blochy-main/plot.js',
  '/Blochy-main/ui.js'
];

  
        for (const src of scripts) {
          await new Promise<void>((resolve, reject) => {
            // Check if script already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => {
              console.warn(`Failed to load script: ${src}`);
              resolve(); // Continue loading other scripts
            };
            document.head.appendChild(script);
          });
        }

        setScriptsLoaded(true);

        // Wait a bit for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
  
        // Initialize global variables with safety checks
        if (typeof window !== 'undefined') {
          window.PHOSPHOR_ENABLED = false;
          window.PHOSPHOR = [];
          
          // Only initialize if math library is available
          if (window.math) {
            window.STATE = [window.math.complex(1, 0), window.math.complex(0, 0)];
          }
          
          // Create and draw the Bloch sphere with safety checks
          if (blochSphereRef.current && window.gen_bloch_sphere) {
            try {
              window.BLOCHSPHERE = window.gen_bloch_sphere();
              if (window.update_state_plot) {
                window.update_state_plot(true);
              }
              setBlochSphereLoaded(true);
            } catch (error) {
              console.warn('Failed to initialize Bloch sphere:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading Blochy scripts:', error);
      }
    };
  
    loadScripts();

    // Cleanup function
    return () => {
      // Clean up any dynamically added scripts and styles
      const scripts = document.querySelectorAll('script[src*="Blochy-main"], script[src*="mathjs"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  const performMeasurement = (axis: 'x' | 'y' | 'z') => {
    // Enhanced validation with RoomLogicEngine
    const validationResult = roomLogicEngine.validateRoomAction('state-chamber', 'measure_axis', { axis });
    
    if (validationResult) {
      setFeedback(validationResult.conceptValidation.feedback);
      if (validationResult.conceptValidation.educationalContent) {
        setShowEducationalContent(true);
      }
      
      if (!validationResult.success) {
        setNeedsHint(true);
        return;
      }
    }

    if (measurementCount[axis] >= 3) return;

    // Trigger cat reaction for measurement action
    catReactionTriggers?.onMeasureClick?.();

    const noise = (Math.random() - 0.5) * 0.2;
    const measurement = 0.6 + noise; // Hidden target state component
    
    setMeasurements(prev => ({ ...prev, [axis]: measurement }));
    setMeasurementCount(prev => ({ ...prev, [axis]: prev[axis] + 1 }));
    
    // Update learning progress
    const totalMeasurements = Object.values(measurementCount).reduce((a, b) => a + b, 0) + 1;
    if (totalMeasurements >= 3 && !conceptsLearned.includes('quantum-measurement')) {
      setConceptsLearned(prev => [...prev, 'quantum-measurement']);
      setCurrentStep(Math.max(currentStep, 1));
    }
    
    if (!isActive && totalMeasurements === 1) {
      setIsActive(true);
    }
  };

  const reconstructState = () => {
    // Enhanced validation with RoomLogicEngine
    const validationResult = roomLogicEngine.validateRoomAction('state-chamber', 'reconstruct_state', {
      measurements: measurements,
      measurementCounts: measurementCount
    });
    
    if (validationResult) {
      setFeedback(validationResult.conceptValidation.feedback);
      if (validationResult.conceptValidation.educationalContent) {
        setShowEducationalContent(true);
      }
      
      if (!validationResult.success) {
        setNeedsHint(true);
        return;
      }
    }

    const reconstructed: BlochVector = {
      x: measurements.x,
      y: measurements.y,
      z: measurements.z
    };
    
    setReconstructedState(reconstructed);
    
    // Update learning progress
    if (!conceptsLearned.includes('state-reconstruction')) {
      setConceptsLearned(prev => [...prev, 'state-reconstruction']);
      setCurrentStep(Math.max(currentStep, 2));
    }
    
    // Check if reconstruction is close to target (for educational feedback)
    const distance = Math.sqrt(
      Math.pow(reconstructed.x - 0.6, 2) +
      Math.pow(reconstructed.y - 0.8, 2) +
      Math.pow(reconstructed.z - 0.2, 2)
    );
    
    if (distance < 0.3) {
      setShowDecoherence(true);
    }
  };

    const applyNoiseFilter = () => {
  setIsFilterApplying(true);

  setTimeout(() => {
    // Enhanced validation with RoomLogicEngine
    const validationResult = roomLogicEngine.validateRoomAction('state-chamber', 'apply_filter', {
      filterStrength: noiseFilter,
      reconstructedState: reconstructedState
    });
    
    if (validationResult) {
      setFeedback(validationResult.conceptValidation.feedback);
      if (validationResult.conceptValidation.educationalContent) {
        setShowEducationalContent(true);
      }
      
      if (validationResult.success && validationResult.roomComplete) {
        setRoomCompleted(true);
        setCurrentStep(4);
        
        // Update learning progress
        if (!conceptsLearned.includes('decoherence-filtering')) {
          setConceptsLearned(prev => [...prev, 'decoherence-filtering']);
        }
        
        // Trigger cat success reaction
        catReactionTriggers?.onSuccess?.();
        
        completeRoom('state-chamber');
      } else if (!validationResult.success) {
        setNeedsHint(true);
      }
    }

    setIsFilterApplying(false);
  }, 1000);
};

  // Helper function to get educational hint
  const getHint = () => {
    const hint = roomLogicEngine.getRoomHint('state-chamber');
    if (hint) {
      setFeedback(hint.message);
      setShowEducationalContent(true);
    }
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (currentStep === step) return <Target className="w-5 h-5 text-blue-400 animate-pulse" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>;
  };

  const getBlochSphereColor = () => {
    if (showDecoherence && noiseFilter < 0.7) {
      return 'from-red-500 to-orange-500';
    }
    return 'from-purple-500 to-violet-500';
  };
  
  // Function to convert Bloch sphere coordinates to Euler angles
  const blochSphereToEuler = (X: number, Y: number, Z: number) => {
    const norm = Math.sqrt(X*X + Y*Y + Z*Z);
    if (norm === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    const x = X / norm;
    const y = Y / norm;
    const z = Z / norm;
    
    const theta = Math.acos(Math.max(-1, Math.min(1, z))); // Clamp to avoid NaN
    const phi = Math.atan2(y, x);
    
    return {
      x: 0,
      y: theta,
      z: phi
    };
  };
  
  // Update Bloch sphere when reconstructed state changes with safety checks
  useEffect(() => {
  if (
    blochSphereLoaded &&
    scriptsLoaded &&
    (reconstructedState.x !== 0 || reconstructedState.y !== 0 || reconstructedState.z !== 0)
  ) {
    try {
      if (window.math && window.STATE && window.rotate_state && window.update_state_plot) {
        // Reset to |0⟩ state
        window.STATE = [window.math.complex(1, 0), window.math.complex(0, 0)];

        // Apply the noise filter to the vector
        const filteredVector = {
          x: reconstructedState.x * noiseFilter,
          y: reconstructedState.y * noiseFilter,
          z: reconstructedState.z * noiseFilter,
        };

        // Convert to Bloch sphere rotation angles
        const rotations = blochSphereToEuler(filteredVector.x, filteredVector.y, filteredVector.z);

        // Rotate the state visually
        window.rotate_state('x', rotations.x);
        window.rotate_state('y', rotations.y);
        window.rotate_state('z', rotations.z);

        // Update plot
        window.update_state_plot(true);
      }
    } catch (error) {
      console.warn('Error updating Bloch sphere:', error);
    }
  }
}, [  
  reconstructedState.x,
  reconstructedState.y,
  reconstructedState.z,
  noiseFilter,
  blochSphereLoaded,
  scriptsLoaded
]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-violet-900/20 p-6">
      
      {/* 📚 Conceptual Introduction Modal */}
      <AnimatePresence>
        {showConceptIntro && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-900/95 rounded-2xl border border-purple-500 max-w-4xl w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🔮</div>
                <h2 className="text-2xl font-bold text-purple-400 mb-4">Quantum State Analysis & Bloch Sphere Theory</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">🔬 What You'll Learn</h3>
                  <div className="text-purple-200 text-sm space-y-2">
                    <p>• How quantum states are represented in 3D space (Bloch sphere)</p>
                    <p>• The relationship between measurement and state reconstruction</p>
                    <p>• How decoherence affects quantum information</p>
                    <p>• Techniques for purifying quantum states through filtering</p>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">🎯 Learning Objectives</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-200">Quantum Measurement Theory</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-200">Bloch Sphere Representation</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-200">State Reconstruction Methods</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-200">Decoherence Filtering Techniques</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-2">📚 The Challenge</h3>
                  <p className="text-green-200 text-sm">
                    A hidden quantum state has been corrupted by environmental noise. Use precise measurements 
                    along X, Y, and Z axes to reconstruct the state vector, then apply decoherence filtering 
                    to purify it back to a pure quantum state (magnitude ≈ 1).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConceptIntro(false)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Begin Quantum State Analysis!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❓ Floating Help Button */}
      {!showConceptIntro && (
        <button
          onClick={() => setShowConceptIntro(true)}
          className="fixed bottom-6 right-6 z-40 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-xl text-xl"
        >
          <BookOpen className="w-6 h-6" />
        </button>
      )}

      <div className="max-w-6xl mx-auto">
        {/* 📊 Learning Progress Panel */}
        <div className="mb-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Quantum State Learning Progress
            </h2>
            {needsHint && (
              <button
                onClick={getHint}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-semibold flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Need Help?</span>
              </button>
            )}
          </div>

          {/* Step Progress */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {['Quantum Measurement', 'Bloch Sphere', 'State Reconstruction', 'Decoherence Filtering'].map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                {getStepIcon(index)}
                <span className={`text-sm ${currentStep > index ? 'text-green-400' : currentStep === index ? 'text-purple-400' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Concepts Learned */}
          {conceptsLearned.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-green-400 mb-2">Concepts Mastered:</h3>
              <div className="flex flex-wrap gap-2">
                {conceptsLearned.map((concept, index) => (
                  <span key={index} className="px-3 py-1 bg-green-900/30 border border-green-500 rounded-full text-xs text-green-300">
                    ✓ {concept.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Educational Feedback */}
          {feedback && (
            <div className={`p-4 rounded-xl border ${
              feedback.includes('✅') ? 'bg-green-900/30 border-green-500' :
              feedback.includes('❌') ? 'bg-red-900/30 border-red-500' :
              'bg-purple-900/30 border-purple-500'
            }`}>
              <p className={`text-sm ${
                feedback.includes('✅') ? 'text-green-300' :
                feedback.includes('❌') ? 'text-red-300' :
                'text-purple-300'
              }`}>
                {feedback}
              </p>
            </div>
          )}
        </div>

        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            STATE CHAMBER
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Master quantum state analysis using the holographic Bloch sphere. Apply measurement theory and 
            decoherence filtering to reconstruct and purify hidden quantum states.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bloch Sphere Visualization */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <Compass className="w-6 h-6 mr-3 text-purple-400" />
                Holographic Bloch Sphere
              </h2>
              {isActive && (
                <div className="flex items-center text-orange-400">
                  <Timer className="w-5 h-5 mr-2" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          
            {/* Bloch Sphere Container */}
            <div className="flex justify-center mb-6">
              <div 
                ref={blochSphereRef}
                id="myDiv" 
                style={{width: '600px', height: '600px'}}
                className="rounded-lg bg-gray-900/50"
              >
                {!blochSphereLoaded && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
                      <p>Loading Quantum Bloch Sphere...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
            {/* Hidden inputs for Blochy scripts */}
            <div style={{display: 'none'}}>
              <input type="hidden" id="spin_color" value="#1a237e" />
              <input type="hidden" id="phosphor_color" value="#1a237e" />
              <input type="hidden" id="phosphor_length" value="10" />
              <input type="hidden" id="north_text" value="0" />
              <input type="hidden" id="south_text" value="1" />
              <input type="hidden" id="export_size" value="800" />
            </div>
          
            {/* Animated Decoherence Warning Section */}
            {showDecoherence && (
              <div className="mb-6 transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-4 fade-in">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 backdrop-blur-sm">
                  {/* Animated background pulse */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 animate-pulse"></div>
                  
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-xl border-2 border-red-500/50 animate-pulse"></div>
                  
                  <div className="relative p-4 space-y-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400 mr-2 animate-bounce" />
                      <span className="text-orange-400 font-semibold animate-pulse">
                        Decoherence Detected!
                      </span>
                      {/* Animated warning dots */}
                      <div className="ml-2 flex space-x-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">
                      The quantum state is degrading. Adjust the noise filter to isolate the true state.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-400">Noise Filter:</label>
                        <span className="text-lg font-mono text-cyan-400 transition-colors duration-300 hover:text-cyan-300">
                          {displayValue.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Zero-lag slider container */}
                      <div className="relative">
                        {/* Background track */}
                        <div className="w-full h-2 bg-gray-700 rounded-lg"></div>
                        
                        {/* Progress indicator with ref for direct manipulation */}
                        <div 
                          ref={progressRef}
                          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg pointer-events-none"
                          style={{width: `${displayValue * 100}%`}}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg"></div>
                        </div>
                        
                        {/* Input slider with zero styling interference */}
                        <input
                          ref={sliderRef}
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={displayValue}
                          onInput={handleSliderInput} // Use onInput instead of onChange for immediate response
                          className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer slider-no-lag"
                        />
                      </div>
                      
                      {/* Filter quality indicator */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              displayValue < 0.3 ? 'bg-red-500' : 
                              displayValue < 0.7 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{width: `${displayValue * 100}%`}}
                          />
                        </div>
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          displayValue < 0.3 ? 'text-red-400' : 
                          displayValue < 0.7 ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          {displayValue < 0.3 ? 'Poor' : 
                           displayValue < 0.7 ? 'Fair' : 
                           'Excellent'}
                        </span>
                      </div>
                      
                      {/* Animated Apply Filter Button */}
                      <button
                        onClick={applyNoiseFilter}
                        disabled={isFilterApplying}
                        className={`w-full px-4 py-3 rounded-xl font-semibold text-white
                                 transition-all duration-300 transform hover:scale-105 
                                 active:scale-95 disabled:scale-100 disabled:opacity-70
                                 ${isFilterApplying 
                                   ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' 
                                   : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400'
                                 }
                                 shadow-lg hover:shadow-xl disabled:cursor-not-allowed
                                 relative overflow-hidden`}
                      >
                        {isFilterApplying && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right"></div>
                        )}
                        <span className="relative flex items-center justify-center">
                          {isFilterApplying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              Processing Filter...
                            </>
                          ) : (
                            'Apply Filter'
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Measurement Control Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-yellow-400" />
              Measurement Control Panel
            </h2>

            <div className="space-y-6">
              {['x', 'y', 'z'].map((axis, index) => (
                <div key={axis} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold capitalize">{axis}-Axis Measurement</label>
                    <span className="text-sm text-gray-400">
                      {measurementCount[axis as keyof typeof measurementCount]}/3 attempts
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => performMeasurement(axis as 'x' | 'y' | 'z')}
                      disabled={measurementCount[axis as keyof typeof measurementCount] >= 3}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                               disabled:opacity-50 disabled:cursor-not-allowed ${
                        axis === 'x' ? 'bg-red-500 hover:bg-red-400' :
                        axis === 'y' ? 'bg-green-500 hover:bg-green-400' :
                        'bg-blue-500 hover:bg-blue-400'
                      }`}
                    >
                      Measure {axis.toUpperCase()}
                    </button>
                    
                    {measurements[axis as keyof typeof measurements] !== 0 && (
                      <div className="text-lg font-mono">
                        {measurements[axis as keyof typeof measurements].toFixed(3)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={reconstructState}
                disabled={Object.values(measurementCount).some(count => count === 0)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-500 
                         hover:from-purple-400 hover:to-violet-400 disabled:opacity-50 
                         disabled:cursor-not-allowed rounded-xl font-semibold text-lg 
                         transition-all duration-300 transform hover:scale-105"
              >
                Reconstruct Quantum State
              </button>

              {reconstructedState.x !== 0 && (
                <div className="mt-6 p-4 bg-gray-700/50 rounded-xl">
                  <h3 className="font-semibold mb-2">Reconstructed State Vector:</h3>
                  <div className="font-mono text-sm space-y-1">
                    <div>X: {reconstructedState.x.toFixed(3)}</div>
                    <div>Y: {reconstructedState.y.toFixed(3)}</div>
                    <div>Z: {reconstructedState.z.toFixed(3)}</div>
                    <div className="mt-2 text-cyan-400">
                      |r| = {Math.sqrt(reconstructedState.x**2 + reconstructedState.y**2 + reconstructedState.z**2).toFixed(3)}
                    </div>
                  </div>
                </div>
              )}

              {roomCompleted && (
                <div className="mt-6 p-6 bg-green-900/30 border border-green-500 rounded-xl">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-green-300 font-semibold text-xl">Quantum State Mastery Achieved!</p>
                  </div>
                  <div className="space-y-3 text-green-200 text-sm">
                    <p>
                      <strong>Conceptual Achievement:</strong> You've successfully demonstrated understanding of quantum state 
                      representation, measurement theory, state reconstruction, and decoherence filtering - essential skills for quantum computing.
                    </p>
                    <p>
                      <strong>What You Learned:</strong> The Bloch sphere provides a geometric representation of quantum states. 
                      Measurements reveal state components but introduce noise, which can be filtered to recover pure quantum information.
                    </p>
                    <div className="bg-green-800/30 p-3 rounded-lg mt-4">
                      <p className="font-semibold text-green-300 mb-2">Key Concepts Mastered:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>• Quantum State Representation</div>
                        <div>• Bloch Sphere Geometry</div>
                        <div>• Measurement-Based Reconstruction</div>
                        <div>• Decoherence Mitigation</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Educational Content Modal */}
              <AnimatePresence>
                {showEducationalContent && (
                  <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowEducationalContent(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-900/95 rounded-2xl border border-purple-500 max-w-2xl w-full p-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">📚</div>
                        <h3 className="text-lg font-bold text-purple-400">Educational Insight</h3>
                      </div>
                      
                      <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4 mb-4">
                        <p className="text-purple-200 text-sm leading-relaxed">
                          {feedback}
                        </p>
                      </div>

                      <button
                        onClick={() => setShowEducationalContent(false)}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors duration-200"
                      >
                        Continue Learning
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateChambrer;
