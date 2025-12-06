import { format } from 'date-fns';
import type { DailyReturnDataPoint, RiskStatistics } from '../types/risk.types';
import type { FirestoreDataPoint } from '../types/investment.types';
import type { Timeframe } from '../hooks/investment/useInvestmentChart';

/**
 * Procesa los datos de Firestore y retorna DailyReturnDataPoint[] ordenados por fecha
 */
export const processDailyReturns = (
  dataPoints: FirestoreDataPoint[]
): DailyReturnDataPoint[] => {
  return dataPoints
    .map((point): DailyReturnDataPoint | null => {
      let timestamp: number;
      
      const dateValue = point.date as { seconds?: number; nanoseconds?: number; toMillis?: () => number };
      
      if (typeof dateValue.toMillis === 'function') {
        timestamp = dateValue.toMillis();
      } else {
        return null;
      }

      const dailyReturn: number = point.dailyReturn ?? 0;
      
      // Validar que dailyReturn sea un número válido
      if (typeof dailyReturn !== 'number' || isNaN(dailyReturn)) {
        return null;
      }

      return {
        date: format(new Date(timestamp), 'dd/MM/yyyy'),
        dailyReturn,
        timestamp,
        isPositive: dailyReturn >= 0,
      };
    })
    .filter((point): point is DailyReturnDataPoint => point !== null)
    .sort((a: DailyReturnDataPoint, b: DailyReturnDataPoint) => a.timestamp - b.timestamp);
};

/**
 * Calcula estadísticas de riesgo basadas en un array de retornos
 */
export const calculateRiskStatistics = (
  returns: number[]
): RiskStatistics => {
  if (returns.length === 0) {
    return {
      totalReturns: 0,
      meanReturn: 0,
      volatility: 0,
      minReturn: 0,
      maxReturn: 0,
    };
  }

  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  const variance = returns.reduce((sum, ret) => {
    return sum + Math.pow(ret - meanReturn, 2);
  }, 0) / returns.length;
  
  const volatility = Math.sqrt(variance);
  
  return {
    totalReturns: returns.length,
    meanReturn,
    volatility,
    minReturn: Math.min(...returns),
    maxReturn: Math.max(...returns),
  };
};

/**
 * Formatea un porcentaje para mostrar
 */
export const formatReturnPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`;
};

/**
 * Determina el color de una barra basado en el retorno diario
 * Retorna verde para positivos, rojo para negativos, con intensidad según magnitud
 */
export const getBarColor = (dailyReturn: number): string => {
  const absReturn = Math.abs(dailyReturn);
  // Normalizar la intensidad (asumiendo que retornos mayores a 10% son raros)
  const intensity = Math.min(absReturn * 10, 1);
  const baseOpacity = 0.6;
  const opacity = baseOpacity + (intensity * 0.4); // Entre 0.6 y 1.0
  
  if (dailyReturn >= 0) {
    // Verde para positivos: #059669
    return `rgba(5, 150, 105, ${opacity})`;
  } else {
    // Rojo para negativos: #DC2626
    return `rgba(220, 38, 38, ${opacity})`;
  }
};

/**
 * Formatea fechas para el eje X según el timeframe seleccionado
 */
export const formatDateForChart = (dateString: string, timeframe: Timeframe): string => {
  try {
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    switch (timeframe) {
      case 'all':
        return monthNames[month - 1];

      case '6M':
      case '3M':
        return `${day} ${monthNames[month - 1]}`;

      case '1M':
      case '7d':
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;

      case '24h':
        return '';

      default:
        return dateString;
    }
  } catch {
    return dateString;
  }
};

/**
 * Formatea valores del eje Y (retornos en porcentaje)
 */
export const formatYAxisTick = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(0)}%`;
};
