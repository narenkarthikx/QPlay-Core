import React, { useState } from 'react';
import {
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  BarChart3, Lock, Unlock
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import AICompanion from '../AICompanion';

const ProbabilityBay: React.FC = () => {
  const { completeRoom } = useGame();

  const [showTutorial, setShowTutorial] = useState(true);
  const [measurements, setMeasurements] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);
  const [lockerCode, setLockerCode] = useState('');
  const [showHistogram, setShowHistogram] = useState(false);
  const [decoySolved, setDecoySolved] = useState(false);
  const [roomCompleted, setRoomCompleted] = useState(false);
  
  // AI Companion state
  const [currentTrigger, setCurrentTrigger] = useState<string>('');

  const rollQuantumDice = () => {
    if (!rollQuantumDice.weights) {
      const rawWeights = Array.from({ length: 6 }, () => Math.random());
      const total = rawWeights.reduce((sum, w) => sum + w, 0);
      rollQuantumDice.weights = rawWeights.map(w => w / total);
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

  const performMeasurements = async () => {
    setIsRolling(true);
    setMeasurements([]);
    rollQuantumDice.weights = null;
    const newMeasurements: number[] = [];

    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 40));
      const result = rollQuantumDice();
      newMeasurements.push(result);
      setMeasurements([...newMeasurements]);
    }

    setIsRolling(false);
    setShowHistogram(true);
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

  const checkLockerCode = () => {
    const histogramData = getHistogramData();
    const maxCount = Math.max(...histogramData);
    const expectedCode = (histogramData.indexOf(maxCount) + 1).toString();

    if (lockerCode === expectedCode) {
      setDecoySolved(true);
      if (selectedLocker === parseInt(expectedCode)) {
        setRoomCompleted(true);
        completeRoom('probability-bay');
      }
    }
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
      {!showTutorial && (
        <button
          onClick={() => setShowTutorial(true)}
          className="fixed bottom-6 right-6 z-40 bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded-full shadow-xl text-xl"
        >
          ?
        </button>
      )}

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
                <h3 className="text-lg font-semibold mb-4">Probability Distribution</h3>
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
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-8 text-center">{index + 1}</div>
                        <div className="flex-1 bg-gray-700 rounded-full h-6 mx-3 relative overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 bg-gradient-to-r ${gradients[index]} shadow-md`}
                            style={{ width: `${(count / Math.max(...getHistogramData())) * 100}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                            {count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              Analyze the histogram to identify the dominant quantum outcome. Enter the value in the correct locker to stabilize the system.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6].map((locker) => (
                <div
                  key={locker}
                  onClick={() => setSelectedLocker(locker)}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    selectedLocker === locker
                      ? 'border-blue-400 bg-blue-900/30'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="text-center">
                    {roomCompleted && locker === parseInt(lockerCode) ? (
                      <Unlock className="w-8 h-8 mx-auto text-green-400 animate-pulse" />
                    ) : (
                      <Lock className="w-8 h-8 mx-auto text-gray-400" />
                    )}
                    <p className="mt-2 text-sm">Locker {locker}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={lockerCode}
                onChange={(e) => setLockerCode(e.target.value)}
                placeholder="Enter the quantum code..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors duration-200"
              />

              <button
                onClick={checkLockerCode}
                disabled={!selectedLocker || !lockerCode}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300"
              >
                Attempt Unlock
              </button>
            </div>

            {decoySolved && !roomCompleted && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-xl">
                <p className="text-red-300 font-semibold">⚠️ Decoy Detected!</p>
                <p className="text-red-200 text-sm mt-2">
                  This locker accepted the code but wasn't aligned with the full interference pattern. Think deeper!
                </p>
              </div>
            )}

            {roomCompleted && (
              <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                <p className="text-green-300 font-semibold">🎉 Probability Bay Solved!</p>
                <p className="text-green-200 text-sm mt-2">
                  You've stabilized the probability field by uncovering the hidden quantum structure!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Companion */}
      <AICompanion 
        roomId="probability-bay"
        triggerCondition={currentTrigger}
        onHintShown={(hint) => console.log('Hint shown:', hint.message)}
      />
    </div>
  );
};

export default ProbabilityBay;
