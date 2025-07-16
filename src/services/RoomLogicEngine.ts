import { Room } from '../types/game';

// Educational concept validation interface
export interface ConceptValidation {
  concept: string;
  isValid: boolean;
  feedback: string;
  hint?: string;
  educationalContent?: string;
}

// Room-specific logic interfaces
export interface RoomLogic {
  roomId: Room;
  currentStep: number;
  maxSteps: number;
  conceptsLearned: string[];
  mistakeCount: number;
  lastAction: string;
  isConceptuallyComplete: boolean;
}

export interface InteractionResult {
  success: boolean;
  conceptValidation: ConceptValidation;
  nextStep?: string;
  roomComplete?: boolean;
  unlockNext?: boolean;
}

export interface EducationalHint {
  level: 'gentle' | 'detailed' | 'conceptual';
  message: string;
  concept: string;
  action?: string;
}

// Abstract base class for room logic engines
export abstract class BaseRoomEngine {
  protected logic: RoomLogic;
  protected conceptOrder: string[] = [];
  protected maxMistakesBeforeHint = 3;

  constructor(roomId: Room) {
    this.logic = {
      roomId,
      currentStep: 0,
      maxSteps: 0,
      conceptsLearned: [],
      mistakeCount: 0,
      lastAction: '',
      isConceptuallyComplete: false
    };
  }

  // Abstract methods that each room must implement
  abstract init(): void;
  abstract validateAction(action: string, data?: any): InteractionResult;
  abstract getContextualHint(): EducationalHint;
  abstract getConceptualIntroduction(): string;
  abstract getStepInstructions(): string[];

  // Common functionality
  incrementMistakes(): void {
    this.logic.mistakeCount++;
  }

  needsHint(): boolean {
    return this.logic.mistakeCount >= this.maxMistakesBeforeHint;
  }

  learnConcept(concept: string): void {
    if (!this.logic.conceptsLearned.includes(concept)) {
      this.logic.conceptsLearned.push(concept);
    }
  }

  getProgress(): number {
    return this.logic.currentStep / this.logic.maxSteps;
  }

  isComplete(): boolean {
    return this.logic.isConceptuallyComplete && this.logic.currentStep >= this.logic.maxSteps;
  }

  getCurrentState(): RoomLogic {
    return { ...this.logic };
  }

  reset(): void {
    this.logic.currentStep = 0;
    this.logic.conceptsLearned = [];
    this.logic.mistakeCount = 0;
    this.logic.lastAction = '';
    this.logic.isConceptuallyComplete = false;
  }
}

// Probability Bay Logic Engine
export class ProbabilityBayEngine extends BaseRoomEngine {
  private measurements: number[] = [];
  private expectedOutcome: number = 0;
  private hasAnalyzedDistribution = false;
  private hasSelectedCorrectLocker = false;

  constructor() {
    super('probability-bay');
    this.conceptOrder = ['randomness', 'probability-distribution', 'statistical-analysis', 'quantum-measurement'];
    this.logic.maxSteps = 4;
  }

  init(): void {
    this.generateQuantumDistribution();
  }

  private generateQuantumDistribution(): void {
    // Create a biased quantum distribution for educational purposes
    const weights = [0.1, 0.3, 0.4, 0.15, 0.04, 0.01]; // Heavily weighted toward 3
    this.expectedOutcome = weights.indexOf(Math.max(...weights)) + 1;
  }

  validateAction(action: string, data?: any): InteractionResult {
    this.logic.lastAction = action;

    switch (action) {
      case 'perform_measurements':
        return this.validateMeasurements(data);
      case 'analyze_distribution':
        return this.validateDistributionAnalysis(data);
      case 'select_locker':
        return this.validateLockerSelection(data);
      case 'enter_code':
        return this.validateCodeEntry(data);
      default:
        this.incrementMistakes();
        return {
          success: false,
          conceptValidation: {
            concept: 'unknown-action',
            isValid: false,
            feedback: 'Unknown action. Please follow the quantum measurement protocol.',
            hint: 'Start by performing quantum measurements to gather data.'
          }
        };
    }
  }

  private validateMeasurements(data: any): InteractionResult {
    if (!data || !Array.isArray(data.measurements) || data.measurements.length < 50) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'quantum-measurement',
          isValid: false,
          feedback: 'Insufficient quantum measurements. You need exactly 50 measurements for statistical significance.',
          hint: 'In quantum mechanics, we need large sample sizes to observe probability patterns.',
          educationalContent: 'Quantum measurements collapse the wave function, revealing one of many possible outcomes. Multiple measurements show the underlying probability distribution.'
        }
      };
    }

    this.measurements = data.measurements;
    this.learnConcept('quantum-measurement');
    this.logic.currentStep = Math.max(this.logic.currentStep, 1);

    return {
      success: true,
      conceptValidation: {
        concept: 'quantum-measurement',
        isValid: true,
        feedback: '✅ Excellent! You\'ve gathered sufficient quantum measurement data. Now analyze the distribution pattern.',
        educationalContent: 'Each measurement collapses the quantum superposition, but the pattern emerges from many trials.'
      },
      nextStep: 'analyze_distribution'
    };
  }

  private validateDistributionAnalysis(data: any): InteractionResult {
    if (this.measurements.length === 0) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'statistical-analysis',
          isValid: false,
          feedback: 'No measurement data to analyze. Perform measurements first.',
          hint: 'You must gather data before you can analyze patterns.'
        }
      };
    }

    // Check if player correctly identified the most frequent outcome
    const counts = Array(6).fill(0);
    this.measurements.forEach(m => counts[m - 1]++);
    const mostFrequent = counts.indexOf(Math.max(...counts)) + 1;

    if (data.identifiedOutcome !== mostFrequent) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'statistical-analysis',
          isValid: false,
          feedback: `❌ Incorrect analysis. The most frequent outcome is ${mostFrequent}, not ${data.identifiedOutcome}.`,
          hint: 'Look at the histogram bars - the tallest bar shows the most probable outcome.',
          educationalContent: 'Statistical analysis reveals the underlying quantum probability distribution through frequency counting.'
        }
      };
    }

    this.hasAnalyzedDistribution = true;
    this.learnConcept('statistical-analysis');
    this.logic.currentStep = Math.max(this.logic.currentStep, 2);

    return {
      success: true,
      conceptValidation: {
        concept: 'statistical-analysis',
        isValid: true,
        feedback: `✅ Perfect statistical analysis! Outcome ${mostFrequent} shows the quantum bias. Now select the corresponding locker.`,
        educationalContent: 'Quantum systems can have hidden biases that only become apparent through statistical analysis of many measurements.'
      },
      nextStep: 'select_locker'
    };
  }

  private validateLockerSelection(data: any): InteractionResult {
    if (!this.hasAnalyzedDistribution) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'logical-progression',
          isValid: false,
          feedback: 'You must analyze the distribution before selecting a locker.',
          hint: 'Follow the scientific method: measure, analyze, then apply findings.'
        }
      };
    }

    const counts = Array(6).fill(0);
    this.measurements.forEach(m => counts[m - 1]++);
    const correctLocker = counts.indexOf(Math.max(...counts)) + 1;

    if (data.lockerId !== correctLocker) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'logical-application',
          isValid: false,
          feedback: `❌ Wrong locker! Your analysis showed outcome ${correctLocker} was most frequent.`,
          hint: 'The locker number should match your statistical analysis result.',
          educationalContent: 'Scientific conclusions must be applied consistently. Your data points to a specific answer.'
        }
      };
    }

    this.hasSelectedCorrectLocker = true;
    this.learnConcept('logical-application');
    this.logic.currentStep = Math.max(this.logic.currentStep, 3);

    return {
      success: true,
      conceptValidation: {
        concept: 'logical-application',
        isValid: true,
        feedback: `✅ Excellent logical application! Locker ${correctLocker} matches your analysis. Now enter the quantum code.`,
        educationalContent: 'Proper scientific reasoning connects data analysis to practical applications.'
      },
      nextStep: 'enter_code'
    };
  }

  private validateCodeEntry(data: any): InteractionResult {
    if (!this.hasSelectedCorrectLocker) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'logical-progression',
          isValid: false,
          feedback: 'Select the correct locker before entering the code.',
          hint: 'Complete each step in the proper sequence.'
        }
      };
    }

    const counts = Array(6).fill(0);
    this.measurements.forEach(m => counts[m - 1]++);
    const correctCode = (counts.indexOf(Math.max(...counts)) + 1).toString();

    if (data.code !== correctCode) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'quantum-reasoning',
          isValid: false,
          feedback: `❌ Incorrect quantum code. The code should be ${correctCode}, matching your most frequent measurement.`,
          hint: 'The quantum code is the number that appeared most often in your measurements.',
          educationalContent: 'Quantum measurement outcomes reveal the underlying structure of reality through statistical patterns.'
        }
      };
    }

    this.learnConcept('quantum-reasoning');
    this.logic.currentStep = 4;
    this.logic.isConceptuallyComplete = true;

    return {
      success: true,
      conceptValidation: {
        concept: 'quantum-reasoning',
        isValid: true,
        feedback: '🎉 Outstanding! You\'ve mastered quantum probability analysis and applied it to unlock the chamber!',
        educationalContent: 'You\'ve demonstrated understanding of quantum measurement, statistical analysis, and logical application - the foundations of quantum information science.'
      },
      roomComplete: true,
      unlockNext: true
    };
  }

  getContextualHint(): EducationalHint {
    if (this.logic.mistakeCount <= 1) {
      return {
        level: 'gentle',
        message: 'Remember to follow the scientific method: observe, analyze, then apply your findings.',
        concept: 'scientific-method'
      };
    } else if (this.logic.mistakeCount <= 3) {
      return {
        level: 'detailed',
        message: 'Look at the histogram carefully. The tallest bar shows which outcome occurred most frequently. That\'s your quantum bias signal!',
        concept: 'statistical-analysis',
        action: 'Find the peak in the probability distribution'
      };
    } else {
      return {
        level: 'conceptual',
        message: 'Quantum systems often have hidden patterns. Your measurements revealed which outcome the quantum dice favors. Use that number as both the locker selection and the code.',
        concept: 'quantum-measurement-collapse',
        action: 'Apply your statistical findings directly'
      };
    }
  }

  getConceptualIntroduction(): string {
    return `🎲 **Quantum Probability & Measurement**

Welcome to Probability Bay! Here you'll learn how quantum measurements reveal hidden probability distributions.

**Key Concepts:**
• Quantum systems can have biased probabilities
• Multiple measurements reveal statistical patterns  
• Scientific analysis guides practical decisions

Your mission: Use quantum measurement and statistical analysis to decode Dr. Schrödinger's probability lock.`;
  }

  getStepInstructions(): string[] {
    return [
      '📊 Perform 50 quantum measurements to gather statistical data',
      '📈 Analyze the histogram to identify the most frequent outcome',  
      '🔍 Select the locker corresponding to your analysis result',
      '🔑 Enter the quantum code (same as most frequent number)',
      '🎉 Unlock the chamber using quantum reasoning!'
    ];
  }
}

// State Chamber Logic Engine
export class StateChamberEngine extends BaseRoomEngine {
  private measurements = { x: 0, y: 0, z: 0 };
  private measurementCounts = { x: 0, y: 0, z: 0 };
  private reconstructedState = { x: 0, y: 0, z: 0 };
  private filterApplied = false;
  private readonly targetState = { x: 0.6, y: 0.8, z: 0.2 };

  constructor() {
    super('state-chamber');
    this.conceptOrder = ['quantum-states', 'bloch-sphere', 'state-reconstruction', 'decoherence-filtering'];
    this.logic.maxSteps = 4;
  }

  init(): void {
    // Initialize with hidden target state
  }

  validateAction(action: string, data?: any): InteractionResult {
    this.logic.lastAction = action;

    switch (action) {
      case 'measure_axis':
        return this.validateAxisMeasurement(data);
      case 'reconstruct_state':
        return this.validateStateReconstruction(data);
      case 'apply_filter':
        return this.validateFilterApplication(data);
      default:
        this.incrementMistakes();
        return {
          success: false,
          conceptValidation: {
            concept: 'unknown-action',
            isValid: false,
            feedback: 'Unknown action. Follow the quantum state analysis protocol.',
            hint: 'Start by measuring the quantum state along different axes.'
          }
        };
    }
  }

  private validateAxisMeasurement(data: any): InteractionResult {
    if (!data || !['x', 'y', 'z'].includes(data.axis)) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'quantum-measurement',
          isValid: false,
          feedback: 'Invalid measurement axis. Choose X, Y, or Z axis for quantum state measurement.',
          hint: 'Quantum states exist in 3D space on the Bloch sphere.'
        }
      };
    }

    const axis = data.axis as 'x' | 'y' | 'z';
    
    if (this.measurementCounts[axis] >= 3) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'measurement-limits',
          isValid: false,
          feedback: `You've already measured the ${axis.toUpperCase()}-axis 3 times. Quantum measurements are destructive - too many disturb the system.`,
          hint: 'Use your existing measurements efficiently. Each axis needs only a few measurements.',
          educationalContent: 'Repeated quantum measurements introduce noise and can destroy quantum information.'
        }
      };
    }

    // Simulate noisy measurement of target state
    const noise = (Math.random() - 0.5) * 0.2;
    const measurement = this.targetState[axis] + noise;
    
    this.measurements[axis] = measurement;
    this.measurementCounts[axis]++;
    
    // Check if we have enough measurements
    const totalMeasurements = Object.values(this.measurementCounts).reduce((a, b) => a + b, 0);
    
    if (totalMeasurements >= 3) {
      this.learnConcept('quantum-measurement');
      this.logic.currentStep = Math.max(this.logic.currentStep, 1);
    }

    return {
      success: true,
      conceptValidation: {
        concept: 'quantum-measurement',
        isValid: true,
        feedback: `✅ ${axis.toUpperCase()}-axis measurement complete: ${measurement.toFixed(3)}. ${totalMeasurements >= 3 ? 'Ready to reconstruct the quantum state!' : 'Continue measuring other axes.'}`,
        educationalContent: `Quantum states in the Bloch sphere are described by three coordinates (x,y,z). Each measurement reveals one component but adds noise.`
      },
      nextStep: totalMeasurements >= 3 ? 'reconstruct_state' : 'continue_measuring'
    };
  }

  private validateStateReconstruction(data: any): InteractionResult {
    const totalMeasurements = Object.values(this.measurementCounts).reduce((a, b) => a + b, 0);
    
    if (totalMeasurements < 3) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'logical-progression',
          isValid: false,
          feedback: 'Insufficient measurement data. You need at least one measurement from each axis.',
          hint: 'Measure X, Y, and Z axes before reconstruction.',
          educationalContent: 'Quantum state reconstruction requires complete information about all three spatial dimensions.'
        }
      };
    }

    // Check if all axes have been measured
    if (Object.values(this.measurementCounts).some(count => count === 0)) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'complete-measurement',
          isValid: false,
          feedback: 'Incomplete measurement set. Each axis (X, Y, Z) must be measured at least once.',
          hint: 'A complete quantum state requires all three Bloch sphere coordinates.',
          educationalContent: 'The Bloch sphere representation needs x, y, and z components to fully specify a qubit state.'
        }
      };
    }

    this.reconstructedState = { ...this.measurements };
    
    // Calculate how close we are to the target
    const distance = Math.sqrt(
      Math.pow(this.reconstructedState.x - this.targetState.x, 2) +
      Math.pow(this.reconstructedState.y - this.targetState.y, 2) +
      Math.pow(this.reconstructedState.z - this.targetState.z, 2)
    );

    this.learnConcept('state-reconstruction');
    this.logic.currentStep = Math.max(this.logic.currentStep, 2);

    if (distance < 0.3) {
      return {
        success: true,
        conceptValidation: {
          concept: 'state-reconstruction',
          isValid: true,
          feedback: '✅ Good state reconstruction! However, the measurements contain decoherence noise. Apply a noise filter to purify the state.',
          educationalContent: 'Real quantum systems suffer from decoherence - environmental interference that corrupts quantum information. Filtering can help recover the pure state.'
        },
        nextStep: 'apply_filter'
      };
    } else {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'state-reconstruction',
          isValid: false,
          feedback: '❌ Reconstruction seems inaccurate. The quantum state vector appears corrupted by measurement noise.',
          hint: 'Try taking more measurements to get better averages, then reconstruct.',
          educationalContent: 'Quantum measurement noise can be reduced by averaging multiple measurements of the same observable.'
        }
      };
    }
  }

  private validateFilterApplication(data: any): InteractionResult {
    if (!data || typeof data.filterStrength !== 'number') {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'decoherence-filtering',
          isValid: false,
          feedback: 'Invalid filter parameters. Specify filter strength between 0 and 1.',
          hint: 'The noise filter should be a value that reduces environmental decoherence.'
        }
      };
    }

    if (Object.values(this.reconstructedState).every(v => v === 0)) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'logical-progression',
          isValid: false,
          feedback: 'No reconstructed state to filter. Reconstruct the quantum state first.',
          hint: 'Complete the measurement and reconstruction steps before filtering.'
        }
      };
    }

    const filterStrength = data.filterStrength;
    
    // Apply the filter
    const filteredState = {
      x: this.reconstructedState.x * filterStrength,
      y: this.reconstructedState.y * filterStrength,
      z: this.reconstructedState.z * filterStrength
    };

    // Check if the filtered state is "pure" (magnitude close to 1)
    const magnitude = Math.sqrt(filteredState.x**2 + filteredState.y**2 + filteredState.z**2);

    if (magnitude < 0.9 || magnitude > 1.1) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'decoherence-filtering',
          isValid: false,
          feedback: `❌ Filter strength ${filterStrength.toFixed(2)} produces invalid state (magnitude: ${magnitude.toFixed(3)}). Pure quantum states must have magnitude ≈ 1.`,
          hint: 'Adjust the filter strength to get a magnitude closer to 1.0. Try a different value.',
          educationalContent: 'Pure quantum states lie on the surface of the Bloch sphere (magnitude = 1). Mixed states are inside the sphere.'
        }
      };
    }

    this.filterApplied = true;
    this.learnConcept('decoherence-filtering');
    this.logic.currentStep = 4;
    this.logic.isConceptuallyComplete = true;

    return {
      success: true,
      conceptValidation: {
        concept: 'decoherence-filtering',
        isValid: true,
        feedback: `🎉 Perfect! Filter strength ${filterStrength.toFixed(2)} produced a pure quantum state (magnitude: ${magnitude.toFixed(3)}). You've mastered quantum state analysis!`,
        educationalContent: 'You\'ve successfully demonstrated quantum measurement, state reconstruction, and decoherence filtering - essential skills for quantum information processing.'
      },
      roomComplete: true,
      unlockNext: true
    };
  }

  getContextualHint(): EducationalHint {
    if (this.logic.mistakeCount <= 1) {
      return {
        level: 'gentle',
        message: 'The Bloch sphere represents quantum states in 3D. Each measurement gives you one coordinate.',
        concept: 'bloch-sphere-basics'
      };
    } else if (this.logic.mistakeCount <= 3) {
      return {
        level: 'detailed',
        message: 'Take measurements from all three axes (X, Y, Z), then reconstruct the state vector. The hidden quantum state has specific coordinates you need to discover.',
        concept: 'quantum-state-measurement',
        action: 'Measure each axis at least once, then reconstruct'
      };
    } else {
      return {
        level: 'conceptual',
        message: 'Quantum states are vectors on the Bloch sphere. Measurements are noisy but reveal the underlying state. Use filtering to remove decoherence and purify the state to magnitude ≈ 1.',
        concept: 'quantum-state-purification',
        action: 'Apply filter strength that produces magnitude close to 1.0'
      };
    }
  }

  getConceptualIntroduction(): string {
    return `🔮 **Quantum State Analysis & Bloch Sphere**

Welcome to the State Chamber! Learn how to analyze and reconstruct quantum states using the Bloch sphere representation.

**Key Concepts:**
• Quantum states exist in 3D space (Bloch sphere)
• Measurements reveal state components but add noise
• Decoherence filtering can purify quantum states
• Pure states have magnitude exactly 1

Your mission: Reconstruct the hidden quantum state and filter out decoherence noise.`;
  }

  getStepInstructions(): string[] {
    return [
      '📡 Measure the quantum state along X, Y, and Z axes',
      '🔧 Reconstruct the 3D state vector from measurements',  
      '🎛️ Apply noise filtering to remove decoherence effects',
      '✨ Achieve a pure quantum state (magnitude ≈ 1)',
      '🎉 Master quantum state analysis and purification!'
    ];
  }
}

// Superposition Tower Logic Engine
export class SuperpositionTowerEngine extends BaseRoomEngine {
  private currentFloor = 0;
  private selectedPath: number[] = [];
  private quantumPads: any[] = [];
  private floorPatterns = [
    { required: [2], description: "Create superposition in the center pad" },
    { required: [1, 3], description: "Two adjacent superposition states for constructive interference" },
    { required: [0, 2, 4], description: "Alternating pattern creates stable quantum bridge" },
    { required: [1, 2, 3], description: "Three consecutive pads form perfect interference pattern" },
    { required: [0, 1, 3, 4], description: "Four-pad configuration for maximum quantum coherence" }
  ];

  constructor() {
    super('superposition-tower');
    this.conceptOrder = ['quantum-superposition', 'hadamard-gates', 'interference-patterns', 'quantum-coherence'];
    this.logic.maxSteps = 5; // 5 floors
  }

  init(): void {
    this.currentFloor = 0;
    this.selectedPath = [];
  }

  validateAction(action: string, data?: any): InteractionResult {
    this.logic.lastAction = action;

    switch (action) {
      case 'apply_hadamard':
        return this.validateHadamardApplication(data);
      case 'step_on_pad':
        return this.validatePadStep(data);
      case 'complete_floor':
        return this.validateFloorCompletion(data);
      default:
        this.incrementMistakes();
        return {
          success: false,
          conceptValidation: {
            concept: 'unknown-action',
            isValid: false,
            feedback: 'Unknown action. Apply Hadamard gates to create superposition, then step on pads in sequence.',
            hint: 'Start by applying Hadamard gates to classical states to create superposition.'
          }
        };
    }
  }

  private validateHadamardApplication(data: any): InteractionResult {
    if (!data || typeof data.padId !== 'number') {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'hadamard-gates',
          isValid: false,
          feedback: 'Invalid Hadamard gate application. Select a specific pad to apply the gate.',
          hint: 'Hadamard gates create superposition: H|0⟩ = (|0⟩ + |1⟩)/√2',
          educationalContent: 'The Hadamard gate is fundamental in quantum computing, creating equal superposition of basis states.'
        }
      };
    }

    this.learnConcept('hadamard-gates');
    this.logic.currentStep = Math.max(this.logic.currentStep, 1);

    return {
      success: true,
      conceptValidation: {
        concept: 'hadamard-gates',
        isValid: true,
        feedback: `✅ Hadamard gate applied to Pad ${data.padId + 1}! Quantum superposition created.`,
        educationalContent: 'You\'ve created a quantum superposition state where the qubit exists in both |0⟩ and |1⟩ simultaneously.'
      },
      nextStep: 'step_on_superposition_pads'
    };
  }

  private validatePadStep(data: any): InteractionResult {
    if (!data || typeof data.padId !== 'number' || data.padState !== 'superposition') {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'quantum-superposition',
          isValid: false,
          feedback: 'Can only step on pads in superposition state! Classical states cannot support quantum tunneling.',
          hint: 'Apply Hadamard gates first to create superposition states.',
          educationalContent: 'Quantum tunneling requires the particle to be in a superposition of position states.'
        }
      };
    }

    const pattern = this.floorPatterns[this.currentFloor];
    if (!pattern.required.includes(data.padId)) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'interference-patterns',
          isValid: false,
          feedback: `❌ Wrong quantum path! Stepping on Pad ${data.padId + 1} creates destructive interference.`,
          hint: `For Floor ${this.currentFloor + 1}, you need to step on: ${pattern.required.map(p => `Pad ${p + 1}`).join(', ')}`,
          educationalContent: 'Quantum interference can be constructive (amplifying probability) or destructive (canceling it out).'
        }
      };
    }

    // Check sequence
    const nextRequired = pattern.required[this.selectedPath.length];
    if (data.padId !== nextRequired) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'quantum-coherence',
          isValid: false,
          feedback: `❌ Incorrect sequence! You must step on Pad ${nextRequired + 1} next to maintain coherence.`,
          hint: 'Quantum coherence requires following the exact sequence for constructive interference.',
          educationalContent: 'Quantum coherence is fragile and requires precise timing and sequencing to maintain.'
        }
      };
    }

    this.selectedPath.push(data.padId);
    this.learnConcept('quantum-superposition');
    this.logic.currentStep = Math.max(this.logic.currentStep, 2);

    return {
      success: true,
      conceptValidation: {
        concept: 'quantum-superposition',
        isValid: true,
        feedback: `✅ Successful quantum step! Path segment ${this.selectedPath.length}/${pattern.required.length} complete.`,
        educationalContent: 'You\'ve successfully navigated a quantum superposition state, demonstrating wave-particle duality.'
      },
      nextStep: this.selectedPath.length === pattern.required.length ? 'complete_floor' : 'continue_path'
    };
  }

  private validateFloorCompletion(data: any): InteractionResult {
    const pattern = this.floorPatterns[this.currentFloor];
    
    if (this.selectedPath.length !== pattern.required.length) {
      this.incrementMistakes();
      return {
        success: false,
        conceptValidation: {
          concept: 'quantum-coherence',
          isValid: false,
          feedback: 'Incomplete quantum path. You must traverse all required superposition states.',
          hint: 'Complete the full interference pattern for this floor.'
        }
      };
    }

    this.currentFloor++;
    this.selectedPath = [];
    this.learnConcept('interference-patterns');
    
    if (this.currentFloor >= 5) {
      this.learnConcept('quantum-coherence');
      this.logic.currentStep = 5;
      this.logic.isConceptuallyComplete = true;
      
      return {
        success: true,
        conceptValidation: {
          concept: 'quantum-coherence',
          isValid: true,
          feedback: '🎉 Superposition Tower conquered! You\'ve mastered quantum superposition and interference patterns!',
          educationalContent: 'You\'ve demonstrated mastery of quantum superposition, Hadamard transformations, and coherent quantum navigation.'
        },
        roomComplete: true,
        unlockNext: true
      };
    }

    this.logic.currentStep = Math.max(this.logic.currentStep, 3);
    
    return {
      success: true,
      conceptValidation: {
        concept: 'interference-patterns',
        isValid: true,
        feedback: `✅ Floor ${this.currentFloor} completed! Perfect interference pattern achieved. Proceeding to next floor.`,
        educationalContent: `Floor ${this.currentFloor}: ${this.floorPatterns[this.currentFloor - 1].description}`
      },
      nextStep: 'next_floor'
    };
  }

  getContextualHint(): EducationalHint {
    if (this.logic.mistakeCount <= 1) {
      return {
        level: 'gentle',
        message: 'Create superposition with Hadamard gates, then step only on superposition pads in the correct sequence.',
        concept: 'superposition-basics'
      };
    } else if (this.logic.mistakeCount <= 3) {
      return {
        level: 'detailed',
        message: `For Floor ${this.currentFloor + 1}: ${this.floorPatterns[this.currentFloor].description}. Apply H gates to the required pads first.`,
        concept: 'quantum-interference',
        action: `Create superposition on pads: ${this.floorPatterns[this.currentFloor].required.map(p => p + 1).join(', ')}`
      };
    } else {
      return {
        level: 'conceptual',
        message: 'Quantum superposition allows particles to exist in multiple states. Use Hadamard gates to create superposition, then navigate the quantum bridge by stepping only on superposition states in the exact required sequence.',
        concept: 'quantum-navigation',
        action: 'Follow the exact sequence for constructive interference'
      };
    }
  }

  getConceptualIntroduction(): string {
    return `🗼 **Quantum Superposition & Wave Interference**

Welcome to the Superposition Tower! Master the quantum principle that allows particles to exist in multiple states simultaneously.

**Key Concepts:**
• Quantum superposition enables multiple simultaneous states
• Hadamard gates create equal probability superpositions
• Quantum interference can be constructive or destructive
• Coherent quantum navigation requires precise sequencing

Your mission: Use superposition and interference to create stable quantum bridges across 5 floors.`;
  }

  getStepInstructions(): string[] {
    return [
      '⚛️ Apply Hadamard gates to create quantum superposition states',
      '🌊 Step only on superposition pads to enable quantum tunneling',
      '🎯 Follow exact sequences to maintain constructive interference',
      '🏗️ Complete quantum bridges across all 5 tower floors',
      '🎉 Master quantum superposition and wave interference!'
    ];
  }
}

// Main Room Logic Engine Manager
export class RoomLogicEngine {
  private engines: Map<Room, BaseRoomEngine> = new Map();

  constructor() {
    // Initialize all room engines
    this.engines.set('probability-bay', new ProbabilityBayEngine());
    this.engines.set('state-chamber', new StateChamberEngine());
    this.engines.set('superposition-tower', new SuperpositionTowerEngine());
    this.engines.set('entanglement-bridge', new EntanglementBridgeEngine());
    this.engines.set('tunneling-vault', new TunnelingVaultEngine());
    this.engines.set('quantum-archive', new QuantumArchiveEngine());
  }

  getEngine(room: Room): BaseRoomEngine | undefined {
    return this.engines.get(room);
  }

  initializeRoom(room: Room): void {
    const engine = this.engines.get(room);
    if (engine) {
      engine.init();
    }
  }

  validateRoomAction(room: Room, action: string, data?: any): InteractionResult | null {
    const engine = this.engines.get(room);
    if (!engine) {
      return null;
    }
    return engine.validateAction(action, data);
  }

  getRoomHint(room: Room): EducationalHint | null {
    const engine = this.engines.get(room);
    if (!engine) {
      return null;
    }
    return engine.getContextualHint();
  }

  getRoomIntroduction(room: Room): string | null {
    const engine = this.engines.get(room);
    if (!engine) {
      return null;
    }
    return engine.getConceptualIntroduction();
  }

  getRoomInstructions(room: Room): string[] | null {
    const engine = this.engines.get(room);
    if (!engine) {
      return null;
    }
    return engine.getStepInstructions();
  }

  getRoomProgress(room: Room): number {
    const engine = this.engines.get(room);
    if (!engine) {
      return 0;
    }
    return engine.getProgress();
  }

  isRoomComplete(room: Room): boolean {
    const engine = this.engines.get(room);
    if (!engine) {
      return false;
    }
    return engine.isComplete();
  }

  resetRoom(room: Room): void {
    const engine = this.engines.get(room);
    if (engine) {
      engine.reset();
    }
  }
}

// Global instance
export const roomLogicEngine = new RoomLogicEngine();