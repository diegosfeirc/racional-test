import { useMemo, useState } from 'react';
import { format, getDate, startOfYear, startOfMonth } from 'date-fns';
import { useInvestmentEvolution } from './useInvestmentEvolution';
import type { ChartDataPoint, FirestoreDataPoint } from '../../types/investment.types';
import type { UseInvestmentChartReturn } from '../interfaces';

export type Timeframe = 
  | '24h' 
  | '7d' 
  | '1M' 
  | '3M' 
  | '6M' 
  | 'MTD'
  | 'YTD'
  | 'all';

/**
 * Calcula el timestamp del inicio del año actual (1 de enero a las 00:00:00)
 * @param referenceDate - Fecha de referencia (por defecto: fecha actual)
 * @returns Timestamp en milisegundos del inicio del año
 */
const getYearStartTimestamp = (referenceDate: Date = new Date()): number => {
  return startOfYear(referenceDate).getTime();
};

/**
 * Calcula el timestamp del inicio del mes actual (día 1 a las 00:00:00)
 * @param referenceDate - Fecha de referencia (por defecto: fecha actual)
 * @returns Timestamp en milisegundos del inicio del mes
 */
const getMonthStartTimestamp = (referenceDate: Date = new Date()): number => {
  return startOfMonth(referenceDate).getTime();
};

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

        const portfolioValue: number = point.portfolioValue || 0;
        const contributions: number = point.contributions || 0;
        const profit: number = portfolioValue - contributions;

        return {
          date: format(new Date(timestamp), 'dd/MM/yyyy'),
          value: portfolioValue,
          contributions: contributions,
          profit: profit,
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
    const lastDate = new Date(lastTimestamp);
    
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
      case 'MTD':
        // Mes hasta la fecha: desde el inicio del mes actual hasta hoy
        startTimestamp = getMonthStartTimestamp(lastDate);
        break;
      case 'YTD':
        // Año hasta la fecha: desde el inicio del año actual hasta hoy
        startTimestamp = getYearStartTimestamp(lastDate);
        break;
      default:
        return allChartData;
    }
    
    return allChartData.filter(point => point.timestamp >= startTimestamp);
  }, [allChartData, selectedTimeframe]);


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

        case 'YTD':
          // Para YTD, mostrar el primer día de cada mes
          if (day === 1 && !seenMonths.has(monthKey)) {
            seenMonths.add(monthKey);
            ticks.push(point.date);
          }
          break;

        case 'MTD':
          // Para MTD, mostrar cada 3-4 días aproximadamente
          if (dayKey !== lastDayKey) {
            dayCount++;
            if (dayCount % 3 === 1 && !seenDays.has(dayKey)) {
              seenDays.add(dayKey);
              ticks.push(point.date);
            }
            lastDayKey = dayKey;
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

        case 'YTD':
          // Para YTD, mostrar mes y año (ej: "Ene 2024")
          return `${monthNames[month - 1]} ${parts[2]}`;

        case 'MTD':
          // Para MTD, mostrar día y mes (ej: "15 Ene")
          return `${day} ${monthNames[month - 1]}`;

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
  const currentContributions: number = filteredChartData.length > 0 
    ? filteredChartData[filteredChartData.length - 1]?.contributions || 0 
    : 0;
  
  // Ganancias reales = portfolioValue - contributions
  const totalGain: number = currentValue - currentContributions;
  
  // Retorno basado en contributions (retorno sobre inversión)
  const returnPercent: string = currentContributions !== 0 
    ? ((totalGain / currentContributions) * 100).toFixed(2) 
    : '0.00';

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '1M', label: '1M' },
    { value: 'MTD', label: 'MTD' },
    { value: '3M', label: '3M' },
    { value: '6M', label: '6M' },
    { value: 'YTD', label: 'YTD' },
    { value: 'all', label: 'Todo' },
  ];

  return {
    loading,
    error,
    filteredChartData,
    xAxisTicks,
    currentValue,
    totalGain,
    currentContributions,
    returnPercent,
    selectedTimeframe,
    setSelectedTimeframe,
    timeframes,
    formatXAxisTick,
  };
};

