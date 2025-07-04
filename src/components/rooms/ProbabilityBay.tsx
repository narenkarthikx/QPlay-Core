import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, BarChart3, Lock, Unlock } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const ProbabilityBay: React.FC = () => {
  const { completeRoom } = useGame();
  const [measurements, setMeasurements] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);
  const [lockerCode, setLockerCode] = useState('');
  const [showHistogram, setShowHistogram] = useState(false);
  const [decoySolved, setDecoySolved] = useState(false);
  const [roomCompleted, setRoomCompleted] = useState(false);

   // Quantum dice simulator - biased towards certain outcomes
        //  Before: fixed bias that always favored locker 4
       // const weights = [0.1, 0.1, 0.15, 0.35, 0.25, 0.05];

const rollQuantumDice = () => {
  if (!rollQuantumDice.weights) {
    const rawWeights = Array.from({ length: 6 }, () => Math.random()); // Random values
    const total = rawWeights.reduce((sum, w) => sum + w, 0);            // Normalize
    rollQuantumDice.weights = rawWeights.map(w => w / total);          // Probabilities sum to 1
  }

  const weights = rollQuantumDice.weights; // Use stored bias for consistency
  const random = Math.random();
  let sum = 0;

  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return i + 1;
    }
  }
  return 6;
};

rollQuantumDice.weights = null as number[] | null;  // static property

  const performMeasurements = async () => {
    setIsRolling(true);
    setMeasurements([]);
    
    rollQuantumDice.weights = null; // Reset the bias before each measurement run

    const newMeasurements: number[] = [];
    
    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
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
    return <Icon className="w-8 h-8" />;
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
      if (selectedLocker === parseInt(expectedCode)) { // Correct locker for quantum pattern
        setRoomCompleted(true);
        completeRoom('probability-bay');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            PROBABILITY BAY
          </h1>
          {/* Backstory for storyline enhancement */}
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-blue-700 shadow-lg">
            <p className="text-base text-blue-200 font-semibold mb-2">
              <span className="font-orbitron text-lg text-pink-300">Backstory:</span> The quantum dice you see were part of an experiment done by the legendary physicist <span className="font-bold text-purple-300">Dr. Schrödinger</span>.
            </p>
            <p className="text-base text-blue-100">
              However, the experiment went horribly wrong, and now the inherent quantum instability of these dice threaten to destroy the entire lab unless you restore balance by analyizing the dice outcomes!
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quantum Dice Simulator */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
              Quantum Dice Simulator
            </h2>
            
            <div className="text-center mb-6">
              <button
                onClick={performMeasurements}
                disabled={isRolling}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 
                         disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg 
                         transition-all duration-300 transform hover:scale-105"
              >
                {isRolling ? 'Measuring Quantum States...' : 'Perform 50 Measurements'}
              </button>
            </div>

            {measurements.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Measurements: {measurements.length}/50
                </p>
                <div className="flex flex-wrap gap-2">
                  {measurements.slice(-10).map((result, index) => (
                    <div key={index} className="p-2 bg-gray-700/50 rounded-lg">
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
                    // Assign a unique gradient for each bar
                    const gradients = [
                      'from-blue-500 to-cyan-400',    // 1
                      'from-purple-500 to-pink-400',  // 2
                      'from-green-500 to-emerald-400',// 3
                      'from-yellow-400 to-orange-500',// 4
                      'from-red-500 to-pink-500',     // 5
                      'from-gray-500 to-gray-300'     // 6
                    ];
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-8 text-center">{index + 1}</div>
                        <div className="flex-1 bg-gray-700 rounded-full h-6 mx-3 relative overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 bg-gradient-to-r ${gradients[index]}`}
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

          {/* Locked Lockers */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-yellow-400" />
              Quantum Lockers
            </h2>
            
            <p className="text-gray-300 mb-6">
              Analyze the histogram to find the quantum pattern. Enter the most probable outcome 
              to unlock the correct locker. Beware of the decoy!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6].map((locker) => (
                <div
                  key={locker}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    selectedLocker === locker
                      ? 'border-blue-400 bg-blue-900/30'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedLocker(locker)}
                >
                  <div className="text-center">
                   {roomCompleted && locker === parseInt(lockerCode) ? (
                      <Unlock className="w-8 h-8 mx-auto text-green-400" />
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
                placeholder="Enter the quantum pattern code..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl 
                         focus:border-blue-400 focus:outline-none transition-colors duration-200"
              />
              
              <button
                onClick={checkLockerCode}
                disabled={!selectedLocker || !lockerCode}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 
                         hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 
                         disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300"
              >
                Attempt Unlock
              </button>
            </div>

            {decoySolved && !roomCompleted && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-xl">
                <p className="text-red-300 font-semibold">⚠️ Decoy Detected!</p>
                <p className="text-red-200 text-sm mt-2">
                  This locker contained false information. The quantum interference pattern 
                  suggests the true solution lies elsewhere. Look for the locker that corresponds 
                  to the most significant quantum deviation!
                </p>
              </div>
            )}

            {roomCompleted && (
              <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                <p className="text-green-300 font-semibold">🎉 Probability Bay Solved!</p>
                <p className="text-green-200 text-sm mt-2">
                  Excellent! You've successfully identified the quantum probability pattern that 
                  distinguishes quantum measurements from classical randomness. The quantum interference 
                  creates a signature that classical systems cannot replicate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityBay;
