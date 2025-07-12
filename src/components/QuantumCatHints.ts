export interface CatHint {
  level: 1 | 2 | 3;
  text: string;
  type: 'subtle' | 'medium' | 'direct';
}

export interface RoomCatConfig {
  position: 'bottom-left' | 'bottom-right';
  hints: CatHint[];
  quotes: string[];
}

export const quantumCatHints: Record<string, RoomCatConfig> = {
  'superposition-tower': {
    position: 'bottom-left',
    hints: [
      {
        level: 1,
        type: 'subtle',
        text: "Don't worry about being in two states… it's quantum normal. 🐱"
      },
      {
        level: 2,
        type: 'medium',
        text: "Try thinking in terms of ON and OFF, at the same time. The H button is your friend! ⚡"
      },
      {
        level: 3,
        type: 'direct',
        text: "Use that 'superposition tower' to balance the states. Apply Hadamard gates to create superposition, then step on the glowing pads in sequence! 🗼"
      }
    ],
    quotes: [
      "In quantum mechanics, I can be both curious AND satisfied at the same time! 😸",
      "Schrödinger really knew how to keep a cat guessing... 🤔",
      "Being in superposition means I'm both helping AND not helping. Quantum logic! 🌟"
    ]
  },
  'probability-bay': {
    position: 'bottom-right',
    hints: [
      {
        level: 1,
        type: 'subtle',
        text: "Sometimes the best path isn't the most obvious one. Think probability! 🎲"
      },
      {
        level: 2,
        type: 'medium',
        text: "Each choice has a different chance of success. Look for patterns in the numbers! 📊"
      },
      {
        level: 3,
        type: 'direct',
        text: "Calculate the probability of each path and choose the one with the highest success rate. Wave functions collapse when measured! 🌊"
      }
    ],
    quotes: [
      "Probability? I prefer to call it 'maybe I will, maybe I won't' mechanics! 🐾",
      "The wave function collapsed when I opened my eyes this morning! 👁️",
      "50% chance of being helpful, 50% chance of being mysterious... perfectly balanced! ⚖️"
    ]
  },
  'state-chamber': {
    position: 'bottom-left',
    hints: [
      {
        level: 1,
        type: 'subtle',
        text: "Every quantum state tells a story. What story are these telling? 📖"
      },
      {
        level: 2,
        type: 'medium',
        text: "States can be manipulated and measured. Try different quantum operations! 🔄"
      },
      {
        level: 3,
        type: 'direct',
        text: "Use quantum gates to transform states into the required configuration. Think about what each gate does to |0⟩ and |1⟩! ⚙️"
      }
    ],
    quotes: [
      "I exist in a chamber, therefore I am... quantum! 💭",
      "State changes are like mood swings, but with more math! 🧮",
      "Being observed changes everything - trust me, I know! 👀"
    ]
  },
  'entanglement-bridge': {
    position: 'bottom-right',
    hints: [
      {
        level: 1,
        type: 'subtle',
        text: "Two particles, one destiny. Connection transcends distance! 🌉"
      },
      {
        level: 2,
        type: 'medium',
        text: "When particles are entangled, measuring one instantly affects the other. Use this spooky action! 👻"
      },
      {
        level: 3,
        type: 'direct',
        text: "Create entangled pairs and use their correlation to bridge the gap. The Bell states are your key! 🔗"
      }
    ],
    quotes: [
      "I'm entangled with my curiosity - measure one, affect the other! 🧬",
      "Spooky action at a distance? More like spooky action at a whisker's length! 👻",
      "Einstein called it spooky, I call it Tuesday! 📅"
    ]
  },
  'tunneling-vault': {
    position: 'bottom-left',
    hints: [
      {
        level: 1,
        type: 'subtle',
        text: "Sometimes you can pass through walls... quantum style! 🧱"
      },
      {
        level: 2,
        type: 'medium',
        text: "Particles can tunnel through energy barriers. Find the sweet spot where probability peaks! ⛰️"
      },
      {
        level: 3,
        type: 'direct',
        text: "Adjust the energy and barrier width to maximize tunneling probability. The wave function must penetrate the barrier! 🌊"
      }
    ],
    quotes: [
      "I tunnel through cardboard boxes all the time - it's not that spooky! 📦",
      "Walls? Where we're going, we don't need no stinking walls! 🚫",
      "Classically impossible, quantumly Tuesday! ⚡"
    ]
  },
  'quantum-archive': {
    position: 'bottom-right',
    hints: [
      {
        level: 1,
        type: 'subtle',
        text: "Knowledge is power, but quantum knowledge is superpower! 📚"
      },
      {
        level: 2,
        type: 'medium',
        text: "The archive holds the secrets. Look for patterns and connections between concepts! 🔍"
      },
      {
        level: 3,
        type: 'direct',
        text: "Combine your understanding from all previous rooms. The quantum archive reveals the full picture! 🧩"
      }
    ],
    quotes: [
      "I've read every quantum mechanics book... in superposition! 📖",
      "The archive knows I'm here before I even arrive. Quantum pre-cognition! 🔮",
      "Information wants to be free, but quantum information wants to be entangled! 🔗"
    ]
  }
};

export const getRandomQuote = (roomId: string): string => {
  const config = quantumCatHints[roomId];
  if (!config || !config.quotes.length) {
    return "Meow... quantum mechanics is purrfect! 🐱";
  }
  return config.quotes[Math.floor(Math.random() * config.quotes.length)];
};

export const getHintForLevel = (roomId: string, level: 1 | 2 | 3): string => {
  const config = quantumCatHints[roomId];
  if (!config || !config.hints.length) {
    return "I'm here to help, but this room is a mystery to me too! 🤷‍♂️";
  }
  
  const hint = config.hints.find(h => h.level === level);
  return hint ? hint.text : config.hints[0].text;
};