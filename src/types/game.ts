export type Room = 
  | 'probability-bay'
  | 'state-chamber'
  | 'superposition-tower'
  | 'entanglement-bridge'
  | 'tunneling-vault'
  | 'quantum-archive';

export interface GameState {
  completedRooms: Room[];
  currentProgress: number;
  achievements: string[];
  totalScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface SafeZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CatAnimation = 
  | 'idle'
  | 'walking'
  | 'sitting'
  | 'celebrating'
  | 'sleeping'
  | 'looking'
  | 'sniffing';

export type CatBehaviorState =
  | 'entry'
  | 'idle'
  | 'success'
  | 'stuck'
  | 'hint';

export interface CatDialog {
  room: Room;
  state: CatBehaviorState;
  messages: string[];
  hints?: string[];
  educationalFacts?: string[];
  stories?: string[];
}

export interface CompanionCatProps {
  currentRoom: Room;
  isRoomCompleted: boolean;
  onHintRequest: () => void;
  safeZones: SafeZone[];
}