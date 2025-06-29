import React, { useState, useEffect } from 'react';
import { Compass, Zap, Timer, AlertTriangle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

interface BlochVector {
  x: number;
  y: number;
  z: number;
}

const StateChambrer: React.FC = () => {
  const { completeRoom } = useGame();
  const [measurements, setMeasurements] = useState({ x: 0, y: 0, z: 0 });
  const [measurementCount, setMeasurementCount] = useState({ x: 0, y: 0, z: 0 });
  const [reconstructedState, setReconstructedState] = useState<BlochVector>({ x: 0, y: 0, z: 0 });
  const [decoherenceLevel, setDecoherenceLevel] = useState(0.8);
  const [noiseFilter, setNoiseFilter] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isActive, setIsActive] = useState(false);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [showDecoherence, setShowDecoherence] = useState(false);

  // Hidden target state (players need to reconstruct this)
  const targetState: BlochVector = { x: 0.6, y: 0.8, z: 0.2 };

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

  const performMeasurement = (axis: 'x' | 'y' | 'z') => {
    if (measurementCount[axis] >= 3) return;

    const noise = (Math.random() - 0.5) * 0.2;
    const measurement = targetState[axis] + noise;
    
    setMeasurements(prev => ({ ...prev, [axis]: measurement }));
    setMeasurementCount(prev => ({ ...prev, [axis]: prev[axis] + 1 }));
    
    if (!isActive && (measurementCount.x + measurementCount.y + measurementCount.z) === 0) {
      setIsActive(true);
    }
  };

  const reconstructState = () => {
    const reconstructed: BlochVector = {
      x: measurements.x,
      y: measurements.y,
      z: measurements.z
    };
    
    setReconstructedState(reconstructed);
    
    // Check if reconstruction is close to target
    const distance = Math.sqrt(
      Math.pow(reconstructed.x - targetState.x, 2) +
      Math.pow(reconstructed.y - targetState.y, 2) +
      Math.pow(reconstructed.z - targetState.z, 2)
    );
    
    if (distance < 0.3) {
      setShowDecoherence(true);
    }
  };

  const applyNoiseFilter = () => {
    const magnitude = Math.sqrt(
      reconstructedState.x ** 2 + reconstructedState.y ** 2 + reconstructedState.z ** 2
    );
    
    if (magnitude > 0.9 && magnitude < 1.1) {
      setRoomCompleted(true);
      completeRoom('state-chamber');
    }
  };

  const getBlochSphereColor = () => {
    if (showDecoherence && noiseFilter < 0.7) {
      return 'from-red-500 to-orange-500';
    }
    return 'from-purple-500 to-violet-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-violet-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            STATE CHAMBER
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Navigate the complex world of quantum states using the holographic Bloch sphere. 
            Reconstruct the hidden qubit state through strategic measurements before decoherence destroys it.
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

            {/* Bloch Sphere Representation */}
            <div className="relative w-80 h-80 mx-auto mb-6">
              <div className={`w-full h-full rounded-full bg-gradient-to-br ${getBlochSphereColor()} 
                             opacity-20 border-2 border-purple-400/50`}></div>
              
              {/* Coordinate axes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* X axis */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-400/50"></div>
                  <div className="absolute top-1/2 right-0 text-red-400 text-sm">X</div>
                  
                  {/* Y axis */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-400/50 transform rotate-45"></div>
                  <div className="absolute top-0 left-1/2 text-green-400 text-sm">Y</div>
                  
                  {/* Z axis */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400/50"></div>
                  <div className="absolute top-0 left-1/2 text-blue-400 text-sm ml-4">Z</div>
                  
                  {/* State vector */}
                  {reconstructedState.x !== 0 || reconstructedState.y !== 0 || reconstructedState.z !== 0 ? (
                    <div
                      className="absolute w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1 -translate-y-1"
                      style={{
                        left: `${50 + reconstructedState.x * 30}%`,
                        top: `${50 - reconstructedState.z * 30}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {showDecoherence && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
                  <span className="text-orange-400 font-semibold">Decoherence Detected!</span>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  The quantum state is degrading. Adjust the noise filter to isolate the true state.
                </p>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Noise Filter: {noiseFilter.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={noiseFilter}
                    onChange={(e) => setNoiseFilter(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <button
                    onClick={applyNoiseFilter}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 
                             hover:from-purple-400 hover:to-violet-400 rounded-xl font-semibold 
                             transition-all duration-300"
                  >
                    Apply Filter
                  </button>
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
                <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                  <p className="text-green-300 font-semibold">🎉 State Chamber Conquered!</p>
                  <p className="text-green-200 text-sm mt-2">
                    Excellent work! You've successfully reconstructed the quantum state and learned to 
                    distinguish between pure and mixed states through decoherence analysis. The Bloch 
                    sphere is now yours to command!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateChambrer;