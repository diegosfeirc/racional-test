import { format } from 'date-fns';
import type { FirestoreDataPoint } from '../types/investment.types';
import type { DailyReturnData } from '../types/volatility.types';


export const processFirestoreDate = (
  dateValue: FirestoreDataPoint['date']
): Date | null => {
  const dateObj = dateValue as {
    seconds?: number;
    nanoseconds?: number;
    toMillis?: () => number;
  };

  let timestamp: number;

  if (typeof dateObj.toMillis === 'function') {
    timestamp = dateObj.toMillis();
  } else if (dateObj.seconds !== undefined) {
    timestamp = dateObj.seconds * 1000;
  } else {
    return null;
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};


export const formatReturn = (value: number | null): string => {
  if (value === null) return '—';
  const percentage = value * 100;
  return percentage >= 0 ? `+${percentage.toFixed(2)}%` : `${percentage.toFixed(2)}%`;
};


export const getReturnClass = (value: number | null): string => {
  if (value === null) return 'return-neutral';
  if (value > 0) return 'return-positive';
  if (value < 0) return 'return-negative';
  return 'return-zero';
};


export const calculateMonthlyAverage = (returns: number[]): number => {
  if (returns.length === 0) return 0;
  const sum = returns.reduce((acc, ret) => acc + ret, 0);
  return sum / returns.length;
};


export const processFirestoreData = (
  dataPoints: FirestoreDataPoint[]
): DailyReturnData[] => {
  return dataPoints
    .map((point): DailyReturnData | null => {
      const date = processFirestoreDate(point.date);
      if (!date) return null;

      return {
        date,
        dailyReturn: point.dailyReturn ?? 0,
        timestamp: date.getTime(),
      };
    })
    .filter((point): point is DailyReturnData => point !== null)
    .sort((a, b) => a.timestamp - b.timestamp);
};


export const createDataMap = (
  data: DailyReturnData[]
): Map<string, number> => {
  const map = new Map<string, number>();
  data.forEach((item) => {
    const key = format(item.date, 'yyyy-MM-dd');
    map.set(key, item.dailyReturn);
  });
  return map;
};

