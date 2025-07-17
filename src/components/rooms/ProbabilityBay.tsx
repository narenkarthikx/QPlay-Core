import React, { useState, useEffect } from 'react';
import {
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  BarChart3, Lock, Unlock, BookOpen, Target, Lightbulb, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CatReactionTriggers } from '../../types/game';
import { roomLogicEngine } from '../../services/RoomLogicEngine';

interface ProbabilityBayProps {
  catReactionTriggers?: CatReactionTriggers;
}

const ProbabilityBay: React.FC<ProbabilityBayProps> = ({ catReactionTriggers }) => {
  const { completeRoom, logQuantumMeasurement } = useGame();

  const [showTutorial, setShowTutorial] = useState(true);
  const [showConceptIntro, setShowConceptIntro] = useState(false);
  const [measurements, setMeasurements] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);
  const [lockerCode, setLockerCode] = useState('');
  const [showHistogram, setShowHistogram] = useState(false);
  const [decoySolved, setDecoySolved] = useState(false);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [roomStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  
  // Enhanced learning state with RoomLogicEngine
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const [conceptsLearned, setConceptsLearned] = useState<string[]>([]);
  const [needsHint, setNeedsHint] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [distributionAnalyzed, setDistributionAnalyzed] = useState(false);
  const [identifiedOutcome, setIdentifiedOutcome] = useState<number | null>(null);

  // Quantum dice with biased distribution for educational purposes
  const rollQuantumDice = () => {
    if (!rollQuantumDice.weights) {
      // Create an educational bias toward outcome 3 for learning purposes
      const rawWeights = [0.1, 0.3, 0.4, 0.15, 0.04, 0.01]; // Heavily biased toward 3
      rollQuantumDice.weights = rawWeights;
    }

    const weights = rollQuantumDice.weights;
    const random = Math.random();
    let sum = 0;

    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return i + 1;
    }
    return 6;
  };
  rollQuantumDice.weights = null as number[] | null;

  // Initialize room logic engine
  useEffect(() => {
    roomLogicEngine.initializeRoom('probability-bay');
    setShowConceptIntro(true);
    // Trigger cat entry reaction
    catReactionTriggers?.onRoomAction?.('room-entered');
  }, []);

  // Enhanced measurement validation with educational feedback
  const performMeasurements = async () => {
    setIsRolling(true);
    setMeasurements([]);
    rollQuantumDice.weights = null;
    const newMeasurements: number[] = [];

    // Trigger cat reaction for measurement action
    catReactionTriggers?.onMeasureClick?.();

    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 40));
      const result = rollQuantumDice();
      newMeasurements.push(result);
      setMeasurements([...newMeasurements]);
    }

    setIsRolling(false);
    setShowHistogram(true);
    
    // Validate with RoomLogicEngine
    const validationResult = roomLogicEngine.validateRoomAction('probability-bay', 'perform_measurements', {
      measurements: newMeasurements
    });

    if (validationResult) {
      setFeedback(validationResult.conceptValidation.feedback);
      if (validationResult.conceptValidation.educationalContent) {
        setShowEducationalContent(true);
      }
      if (validationResult.success) {
        setCurrentStep(1);
        if (!conceptsLearned.includes('quantum-measurement')) {
          setConceptsLearned(prev => [...prev, 'quantum-measurement']);
        }
      } else {
        setNeedsHint(true);
      }
    }
    
    // Log quantum measurements to Supabase
    await logQuantumMeasurement('probability-bay', 'quantum_dice_measurements', {
      measurements: newMeasurements,
      measurement_count: newMeasurements.length,
      timestamp: new Date().toISOString()
    });
  };

  // Enhanced distribution analysis with concept validation
  const analyzeDistribution = () => {
    if (measurements.length === 0) {
      const validationResult = roomLogicEngine.validateRoomAction('probability-bay', 'analyze_distribution', {
        identifiedOutcome: null
      });
      if (validationResult) {
        setFeedback(validationResult.conceptValidation.feedback);
        setNeedsHint(true);
      }
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const counts = getHistogramData();
      const maxCount = Math.max(...counts);
      const mostFrequent = counts.indexOf(maxCount) + 1;
      
      setIdentifiedOutcome(mostFrequent);
      setDistributionAnalyzed(true);
      
      // Validate with RoomLogicEngine
      const validationResult = roomLogicEngine.validateRoomAction('probability-bay', 'analyze_distribution', {
        identifiedOutcome: mostFrequent
      });

      if (validationResult) {
        setFeedback(validationResult.conceptValidation.feedback);
        if (validationResult.conceptValidation.educationalContent) {
          setShowEducationalContent(true);
        }
        if (validationResult.success) {
          setCurrentStep(2);
          if (!conceptsLearned.includes('statistical-analysis')) {
            setConceptsLearned(prev => [...prev, 'statistical-analysis']);
          }
        }
      }
      
      setIsAnalyzing(false);
    }, 2000);
  };

  // Enhanced locker selection with concept validation
  const selectLocker = (lockerId: number) => {
    setSelectedLocker(lockerId);
    
    // Validate with RoomLogicEngine
    const validationResult = roomLogicEngine.validateRoomAction('probability-bay', 'select_locker', {
      lockerId: lockerId
    });

    if (validationResult) {
      setFeedback(validationResult.conceptValidation.feedback);
      if (validationResult.conceptValidation.educationalContent) {
        setShowEducationalContent(true);
      }
      if (validationResult.success) {
        setCurrentStep(3);
        if (!conceptsLearned.includes('logical-application')) {
          setConceptsLearned(prev => [...prev, 'logical-application']);
        }
      } else {
        setNeedsHint(true);
      }
    }
  };

  // Enhanced code checking with comprehensive validation
  const checkLockerCode = async () => {
    setAttempts(prev => prev + 1);
    
    // Validate with RoomLogicEngine
    const validationResult = roomLogicEngine.validateRoomAction('probability-bay', 'enter_code', {
      code: lockerCode
    });

    if (validationResult) {
      setFeedback(validationResult.conceptValidation.feedback);
      
      if (validationResult.success && validationResult.roomComplete) {
        setRoomCompleted(true);
        setCurrentStep(4);
        
        // Trigger cat success reaction
        catReactionTriggers?.onSuccess?.();
        
        // Calculate completion metrics
        const completionTime = Date.now() - roomStartTime;
        const score = Math.max(1000 - (attempts - 1) * 100 - Math.floor(completionTime / 1000), 100);
        
        // Complete room with metrics
        await completeRoom('probability-bay', {
          time: completionTime,
          attempts: attempts,
          score: score
        });
      } else {
        // Trigger failure reaction
        catReactionTriggers?.onFailure?.(attempts);
        setNeedsHint(true);
      }
    }
  };

  // Helper function to get educational hint
  const getHint = () => {
    const hint = roomLogicEngine.getRoomHint('probability-bay');
    if (hint) {
      setFeedback(hint.message);
      setShowEducationalContent(true);
    }
  };

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value - 1];
    return <Icon className={`w-8 h-8 ${isRolling ? 'animate-bounce' : ''}`} />;
  };

  const getHistogramData = () => {
    const counts = [0, 0, 0, 0, 0, 0];
    measurements.forEach(m => counts[m - 1]++);
    return counts;
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (currentStep === step) return <Target className="w-5 h-5 text-blue-400 animate-pulse" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>;
  };

  const startTutorial = () => {
    setShowTutorial(false);
    setShowConceptIntro(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6">

      {/* 🎓 Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-900/95 rounded-2xl border border-yellow-500 max-w-3xl w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎲</div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Probability Bay Tutorial</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-300 mb-2">🔬 The Science</h3>
                  <p className="text-yellow-200 text-sm">
                    In quantum mechanics, outcome probabilities arise from interference. You’ll simulate 50 quantum dice rolls,
                    then analyze the histogram to identify bias.
                  </p>
                </div>

                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">🎮 Step-by-Step</h3>
                  <ol className="text-purple-200 text-sm list-decimal list-inside space-y-1">
                    <li>Click “Perform Measurements” to roll 50 times</li>
                    <li>View the histogram of results</li>
                    <li>Choose the most frequent number</li>
                    <li>Click a locker and enter the number</li>
                    <li>Avoid decoys! Only one locker is correct</li>
                  </ol>
                </div>

                <div className="bg-red-900/30 border border-red-500 rounded-xl p-4">
                  <h3 className="font-semibold text-red-300 mb-2">⚠️ Decoy Warning</h3>
                  <p className="text-red-200 text-sm">
                    Some lockers accept the right number but are false positives. Only the true quantum locker will complete the room.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Begin Analysis!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❓ Floating Help Button */}
      {!showTutorial && !showConceptIntro && (
        <button
          onClick={() => setShowConceptIntro(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-xl text-xl"
        >
          <BookOpen className="w-6 h-6" />
        </button>
      )}

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
              className="bg-gray-900/95 rounded-2xl border border-blue-500 max-w-4xl w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎲</div>
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Quantum Probability & Measurement Theory</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">🔬 What You'll Learn</h3>
                  <div className="text-blue-200 text-sm space-y-2">
                    <p>• How quantum measurements reveal hidden probability distributions</p>
                    <p>• The relationship between wave function collapse and statistical patterns</p>
                    <p>• How to apply scientific analysis to decode quantum information</p>
                    <p>• The difference between random chance and quantum bias</p>
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">🎯 Learning Objectives</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200">Quantum Measurement Protocol</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200">Statistical Distribution Analysis</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200">Logical Application of Findings</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200">Scientific Reasoning Skills</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-2">📚 The Challenge</h3>
                  <p className="text-green-200 text-sm">
                    Dr. Schrödinger's quantum dice are exhibiting mysterious bias patterns. Use the scientific method 
                    to measure, analyze, and decode the quantum probability signature hidden in the measurement data. 
                    Only proper understanding of quantum measurement theory will unlock the chamber!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConceptIntro(false)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Begin Quantum Analysis!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔧 Game Content */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            PROBABILITY BAY
          </h1>
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-blue-700 shadow-lg">
            <p className="text-base text-blue-200 font-semibold mb-2">
              <span className="font-orbitron text-lg text-pink-300">Backstory:</span> Dr. Schrödinger’s quantum dice are leaking randomness into the lab!
            </p>
            <p className="text-base text-blue-100">
              Identify and stabilize the dominant probability to prevent quantum collapse.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 🧪 Dice Simulator */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
              Quantum Dice Simulator
            </h2>

            <div className="text-center mb-6">
              <button
                onClick={performMeasurements}
                disabled={isRolling}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                {isRolling ? 'Measuring Quantum States...' : 'Perform 50 Measurements'}
              </button>
            </div>

            {measurements.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-300 mb-4">Measurements: {measurements.length}/50</p>
                <div className="flex flex-wrap gap-2">
                  {measurements.slice(-10).map((result, index) => (
                    <div key={index} className="p-2 bg-gray-700/50 rounded-lg transition-transform duration-200">
                      {getDiceIcon(result)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showHistogram && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Probability Distribution</h3>
                  {!distributionAnalyzed && measurements.length === 50 && (
                    <button
                      onClick={analyzeDistribution}
                      disabled={isAnalyzing}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-sm font-semibold flex items-center space-x-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Distribution'}</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {getHistogramData().map((count, index) => {
                    const gradients = [
                      'from-blue-500 to-cyan-400',
                      'from-purple-500 to-pink-400',
                      'from-green-500 to-emerald-400',
                      'from-yellow-400 to-orange-500',
                      'from-red-500 to-pink-500',
                      'from-gray-500 to-gray-300'
                    ];
                    const isHighest = count === Math.max(...getHistogramData()) && count > 0;
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-8 text-center">{index + 1}</div>
                        <div className={`flex-1 bg-gray-700 rounded-full h-6 mx-3 relative overflow-hidden ${
                          isHighest && distributionAnalyzed ? 'ring-2 ring-yellow-400' : ''
                        }`}>
                          <div
                            className={`h-full transition-all duration-1000 bg-gradient-to-r ${gradients[index]} shadow-md`}
                            style={{ width: `${(count / Math.max(...getHistogramData())) * 100}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                            {count}
                          </div>
                        </div>
                        {isHighest && distributionAnalyzed && (
                          <div className="text-yellow-400 text-xs font-semibold">
                            PEAK ← Most Frequent
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {distributionAnalyzed && identifiedOutcome && (
                  <div className="mt-4 p-3 bg-purple-900/30 border border-purple-500 rounded-lg">
                    <p className="text-purple-300 text-sm">
                      ✅ Analysis Complete: Outcome <strong>{identifiedOutcome}</strong> shows {Math.round((Math.max(...getHistogramData()) / 50) * 100)}% frequency
                      <br />
                      <span className="text-purple-400">This reveals the quantum bias pattern! Use this finding to select the correct locker.</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🔐 Lockers */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-yellow-400" />
              Quantum Lockers
            </h2>

            <p className="text-gray-300 mb-6">
              Apply your statistical analysis to select the correct quantum locker. The locker number should match your findings about the most frequent measurement outcome.
            </p>

            {!distributionAnalyzed && measurements.length === 50 && (
              <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500 rounded-xl">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-300 font-semibold">Analysis Required</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  You must analyze the probability distribution before selecting a locker. Click "Analyze Distribution" above to proceed scientifically.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6].map((locker) => {
                const isRecommended = distributionAnalyzed && identifiedOutcome === locker;
                return (
                  <div
                    key={locker}
                    onClick={() => distributionAnalyzed ? selectLocker(locker) : null}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      !distributionAnalyzed 
                        ? 'border-gray-600 bg-gray-800/30 opacity-50 cursor-not-allowed'
                        : selectedLocker === locker
                        ? 'border-blue-400 bg-blue-900/30 cursor-pointer'
                        : isRecommended
                        ? 'border-yellow-400 bg-yellow-900/30 cursor-pointer ring-2 ring-yellow-400/50'
                        : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer'
                    }`}
                  >
                    <div className="text-center">
                      {roomCompleted && locker === parseInt(lockerCode) ? (
                        <Unlock className="w-8 h-8 mx-auto text-green-400 animate-pulse" />
                      ) : (
                        <Lock className="w-8 h-8 mx-auto text-gray-400" />
                      )}
                      <p className="mt-2 text-sm">Locker {locker}</p>
                      {isRecommended && (
                        <div className="mt-1 text-xs text-yellow-400 font-semibold">
                          ← Suggested by Analysis
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={lockerCode}
                onChange={(e) => setLockerCode(e.target.value)}
                placeholder={distributionAnalyzed && identifiedOutcome ? `Enter ${identifiedOutcome} (from your analysis)` : "Complete analysis first..."}
                disabled={!selectedLocker || !distributionAnalyzed}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors duration-200 disabled:opacity-50"
              />

              <button
                onClick={checkLockerCode}
                disabled={!selectedLocker || !lockerCode || !distributionAnalyzed}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300"
              >
                Apply Scientific Finding
              </button>
              
              {distributionAnalyzed && selectedLocker && identifiedOutcome && (
                <div className="text-center text-sm text-gray-400">
                  💡 Hint: Your analysis showed outcome {identifiedOutcome} was most frequent
                </div>
              )}
            </div>

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

            {decoySolved && !roomCompleted && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-xl">
                <p className="text-red-300 font-semibold">⚠️ Decoy Detected!</p>
                <p className="text-red-200 text-sm mt-2">
                  This locker accepted the code but wasn't aligned with the full interference pattern. Think deeper!
                </p>
              </div>
            )}

            {roomCompleted && (
              <div className="mt-6 p-6 bg-green-900/30 border border-green-500 rounded-xl">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-green-300 font-semibold text-xl">Quantum Measurement Mastery Achieved!</p>
                </div>
                <div className="space-y-3 text-green-200 text-sm">
                  <p>
                    <strong>Conceptual Achievement:</strong> You've successfully demonstrated understanding of quantum measurement 
                    theory, statistical analysis, and scientific reasoning - the foundations of quantum information science.
                  </p>
                  <p>
                    <strong>What You Learned:</strong> Quantum systems can exhibit hidden probability biases that only become 
                    apparent through proper measurement and statistical analysis. This principle underlies quantum cryptography, 
                    quantum random number generation, and quantum error correction.
                  </p>
                  <div className="bg-green-800/30 p-3 rounded-lg mt-4">
                    <p className="font-semibold text-green-300 mb-2">Key Concepts Mastered:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>• Quantum Measurement Protocol</div>
                      <div>• Statistical Distribution Analysis</div>
                      <div>• Logical Application of Findings</div>
                      <div>• Scientific Reasoning Methods</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityBay;
