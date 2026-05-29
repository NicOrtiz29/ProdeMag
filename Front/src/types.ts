/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  role: string; // Equipo intero / Cargo
  province?: string;
  isAdmin?: boolean;
  avatar: string;
  points: number;
  accuracy: number;
  streak: number;
  bio?: string;
  lastPredictions?: string;
}

export interface Match {
  id: string; // P1, P2, etc.
  localTeam: string;
  localCode: string;
  visitorTeam: string;
  visitorCode: string;
  rivalry: 'Baja' | 'Media' | 'Alta';
  probabilityText: string;
  importance: string;
  prediction: [number, number]; // [golesLocal, golesVis] (user's or bot's temp prediction)
  realResult?: [number, number]; // Official result set by Admin
  flagLocal: string; // Emoji
  flagVis: string; // Emoji
  group: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';
  fecha: number; // 1, 2, 3
  hora: string; // e.g., "18:30"
  lugar: string; // stadium name
  hasPrediction?: boolean;
}

export interface StandingsEntry {
  id: string;
  name: string;
  points: number;
  isBot: boolean;
  avatar: string;
  province?: string;
  role?: string;
  accuracy?: number;
  streak?: number;
  lastPredictions?: string;
}

export interface ChallengeTone {
  id: string;
  name: string;
  emoji: string;
  badge: string;
  message: string;
}

export interface HistoricalMatch {
  id: string;
  matchName: string;
  realResult: [number, number];
  oraclePrediction: [number, number];
  humanPrediction: [number, number];
  pointsOracle: number;
  pointsHuman: number;
  commentary: string;
}

export interface BotStatItem {
  label: string;
  value: string | number;
  subValue: string;
  icon: string;
}
