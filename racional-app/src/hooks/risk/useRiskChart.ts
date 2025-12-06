import { useMemo, useState } from 'react';
import { format, getDate } from 'date-fns';
import { useInvestmentEvolution } from '../investment/useInvestmentEvolution';
import { processDailyReturns, calculateRiskStatistics, formatDateForChart } from '../../utils/riskChart';
import type { DailyReturnDataPoint, RiskStatistics } from '../../types/risk.types';
import type { UseRiskChartReturn } from '../interfaces';
import type { Timeframe } from '../investment/useInvestmentChart';

export const useRiskChart = (
  userId: string = 'user1'
): UseRiskChartReturn => {
  const { data, loading, error } = useInvestmentEvolution(userId);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('all');

  // Procesar todos los datos de retornos diarios
  const allDailyReturns = useMemo((): DailyReturnDataPoint[] => {
    if (!data?.array || !Array.isArray(data.array)) {
      return [];
    }

    return processDailyReturns(data.array);
  }, [data]);

  // Filtrar datos según el timeframe seleccionado
  const filteredData = useMemo((): DailyReturnDataPoint[] => {
    if (allDailyReturns.length === 0) return [];
    
    if (selectedTimeframe === 'all') return allDailyReturns;
    
    const lastTimestamp = allDailyReturns[allDailyReturns.length - 1]?.timestamp;
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
        return allDailyReturns;
    }
    
    return allDailyReturns.filter(point => point.timestamp >= startTimestamp);
  }, [allDailyReturns, selectedTimeframe]);

  // Calcular estadísticas basadas en los datos filtrados
  const statistics = useMemo((): RiskStatistics => {
    const returns = filteredData.map(point => point.dailyReturn);
    return calculateRiskStatistics(returns);
  }, [filteredData]);

  // Calcular qué ticks mostrar según el timeframe
  const xAxisTicks = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    const ticks: string[] = [];
    const seenMonths = new Set<string>();
    const seenDays = new Set<string>();
    let dayCount = 0;
    let lastDayKey = '';

    filteredData.forEach((point) => {
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
        case '7d':
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
  }, [filteredData, selectedTimeframe]);

  // Formatear los ticks según el timeframe
  const formatXAxisTick = (value: string): string => {
    return formatDateForChart(value, selectedTimeframe);
  };

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
    filteredData,
    xAxisTicks,
    statistics,
    selectedTimeframe,
    setSelectedTimeframe,
    timeframes,
    formatXAxisTick,
  };
};
