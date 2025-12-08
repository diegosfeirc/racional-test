import type { Timestamp } from 'firebase/firestore';

export interface FirestoreTimestamp {
  type: string;
  seconds: number;
  nanoseconds: number;
}

export interface FirestoreDataPoint {
  date: FirestoreTimestamp | Timestamp;
  portfolioValue: number;
  portfolioIndex: number;
  dailyReturn: number;
  contributions: number;
}

export interface InvestmentEvolution {
  array: FirestoreDataPoint[];
  userId?: string;
}

export interface InvestmentDataPoint {
  timestamp: number;
  value: number;
}

export interface ChartDataPoint {
  date: string;
  value: number; // portfolioValue
  contributions: number; // Costo base / Principal
  profit: number; // value - contributions (para cálculos y visualización)
  timestamp: number;
  ma7?: number; // Moving Average de 7 días
  ma25?: number; // Moving Average de 25 días
  ma99?: number; // Moving Average de 99 días
}
