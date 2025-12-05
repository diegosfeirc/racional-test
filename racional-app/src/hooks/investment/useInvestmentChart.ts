import { useMemo, useState } from 'react';
import { format, getDate } from 'date-fns';
import { useInvestmentEvolution } from './useInvestmentEvolution';
import type { ChartDataPoint, FirestoreDataPoint } from '../../types/investment.types';
import type { UseInvestmentChartReturn } from '../interfaces';

export type Timeframe = 
  | '24h' 
  | '7d' 
  | '1M' 
  | '3M' 
  | '6M' 
  | 'all';

export const useInvestmentChart = (
  userId: string = 'user1'
): UseInvestmentChartReturn => {
  const { data, loading, error } = useInvestmentEvolution(userId);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('all');

  // Procesar todos los datos del gráfico
  const allChartData = useMemo((): ChartDataPoint[] => {
    if (!data?.array || !Array.isArray(data.array)) {
      return [];
    }

    return data.array
      .map((point: FirestoreDataPoint): ChartDataPoint | null => {
        let timestamp: number;
        
        const dateValue = point.date as { seconds?: number; nanoseconds?: number; toMillis?: () => number };
        
        if (typeof dateValue.toMillis === 'function') {
          timestamp = dateValue.toMillis();
        } else {
          return null;
        }

        return {
          date: format(new Date(timestamp), 'dd/MM/yyyy'),
          value: point.portfolioValue || 0,
          timestamp,
        };
      })
      .filter((point): point is ChartDataPoint => point !== null)
      .sort((a: ChartDataPoint, b: ChartDataPoint) => a.timestamp - b.timestamp);
  }, [data]);


  // Filtrar datos según el timeframe seleccionado
  const filteredChartData = useMemo((): ChartDataPoint[] => {
    if (allChartData.length === 0) return [];
    
    if (selectedTimeframe === 'all') return allChartData;
    
    const lastTimestamp = allChartData[allChartData.length - 1]?.timestamp;
    if (!lastTimestamp) return [];
    
    let startTimestamp: number;
    
    switch (selectedTimeframe) {
      case '24h':
        startTimestamp = lastTimestamp - (24 * 60 * 60 * 1000); // 24 horas en milisegundos
        break;
      case '7d':
        startTimestamp = lastTimestamp - (7 * 24 * 60 * 60 * 1000); // 7 días
        break;
      case '1M':
        startTimestamp = lastTimestamp - (30 * 24 * 60 * 60 * 1000); // ~30 días (1 mes)
        break;
      case '3M':
        startTimestamp = lastTimestamp - (90 * 24 * 60 * 60 * 1000); // ~90 días (3 meses)
        break;
      case '6M':
        startTimestamp = lastTimestamp - (180 * 24 * 60 * 60 * 1000); // ~180 días (6 meses)
        break;
      default:
        return allChartData;
    }
    
    return allChartData.filter(point => point.timestamp >= startTimestamp);
  }, [allChartData, selectedTimeframe]);


  // Calcular regresión lineal y combinar con datos filtrados
  const chartDataWithRegression = useMemo((): ChartDataPoint[] => {
    if (filteredChartData.length === 0) return [];
    
    if (filteredChartData.length < 2) {
      return filteredChartData.map(point => ({
        ...point,
        regressionValue: point.value,
      }));
    }

    const n = filteredChartData.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = filteredChartData.map(point => point.value);
    
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const denominator = n * sumXX - sumX * sumX;
    const m = denominator !== 0 
      ? (n * sumXY - sumX * sumY) / denominator 
      : 0;
    const b = (sumY - m * sumX) / n;
    
    return filteredChartData.map((point, index) => ({
      ...point,
      regressionValue: m * index + b,
    }));
  }, [filteredChartData]);


  // Calcular qué ticks mostrar según el timeframe
  const xAxisTicks = useMemo(() => {
    if (filteredChartData.length === 0) return [];
    
    const ticks: string[] = [];
    const seenMonths = new Set<string>();
    const seenDays = new Set<string>();
    let dayCount = 0;
    let lastDayKey = '';

    filteredChartData.forEach((point) => {
      const date = new Date(point.timestamp);
      const day = getDate(date);
      const monthKey = format(date, 'yyyy-MM');
      const dayKey = format(date, 'yyyy-MM-dd');

      switch (selectedTimeframe) {
        case 'all':
          if (!seenMonths.has(monthKey)) {
            seenMonths.add(monthKey);
            ticks.push(point.date);
          }
          break;

        case '6M':
          if ((day === 1 || day === 15) && !seenDays.has(dayKey)) {
            seenDays.add(dayKey);
            ticks.push(point.date);
          }
          break;

        case '3M':
          if ((day === 1 || day === 7 || day === 14 || day === 21) && !seenDays.has(dayKey)) {
            seenDays.add(dayKey);
            ticks.push(point.date);
          }
          break;

        case '1M':
          if (dayKey !== lastDayKey) {
            dayCount++;
            if (dayCount % 2 === 1 && !seenDays.has(dayKey)) {
              seenDays.add(dayKey);
              ticks.push(point.date);
            }
            lastDayKey = dayKey;
          }
          break;

        case '24h':
          break;

        default:
          break;
      }
    });

    return ticks;
  }, [filteredChartData, selectedTimeframe]);


  // Formatear los ticks según el timeframe
  const formatXAxisTick = (value: string): string => {
    try {
      const parts = value.split('/');
      if (parts.length !== 3) return value;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      switch (selectedTimeframe) {
        case 'all':
          return monthNames[month - 1];

        case '6M':
        case '3M':
          return `${day} ${monthNames[month - 1]}`;

        case '1M':
          return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;

        case '24h':
          return '';

        default:
          return value;
      }
    } catch {
      return value;
    }
  };

  
  // Calcular estadísticas basadas en los datos FILTRADOS
  const currentValue: number = filteredChartData.length > 0 
    ? filteredChartData[filteredChartData.length - 1]?.value || 0 
    : 0;
  const previousValue: number = filteredChartData.length > 1 
    ? filteredChartData[filteredChartData.length - 2]?.value || 0 
    : currentValue;
  const initialValue: number = filteredChartData.length > 0 
    ? filteredChartData[0]?.value || 0 
    : 0;
  const totalGain: number = currentValue - initialValue;
  const returnPercent: string = initialValue !== 0 
    ? ((totalGain / initialValue) * 100).toFixed(2) 
    : '0.00';
  
  const recentChange: number = currentValue - previousValue;
  const recentChangePercent: string = previousValue !== 0 
    ? ((recentChange / previousValue) * 100).toFixed(2) 
    : '0.00';

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: '6M', label: '6M' },
    { value: 'all', label: 'Todo' },
  ];

  return {
    loading,
    error,
    filteredChartData: chartDataWithRegression,
    xAxisTicks,
    currentValue,
    totalGain,
    recentChange,
    recentChangePercent,
    returnPercent,
    selectedTimeframe,
    setSelectedTimeframe,
    timeframes,
    formatXAxisTick,
  };
};

