import { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  addMonths,
  subMonths,
  addYears,
  subYears,
  getDaysInMonth,
  getDay,
  isSameDay,
  subDays,
} from 'date-fns';
import { useInvestmentEvolution } from '../investment/useInvestmentEvolution';
import type { ViewMode, CalendarDay, CalendarMonth, PeriodStats } from '../../types/returns.types';
import type { UseReturnsCalendarReturn } from '../interfaces';
import {
  processFirestoreData,
  createDataMap,
  formatReturn,
  getReturnClass,
} from '../../utils/returnsCalendar';

/**
 * Hook personalizado para manejar la lógica del calendario de retornos
 * @param userId - ID del usuario (por defecto 'user1')
 * @returns Objeto con datos procesados, navegación y utilidades
 */
export const useReturnsCalendar = (
  userId: string = 'user1'
): UseReturnsCalendarReturn => {
  const { data, loading, error } = useInvestmentEvolution(userId);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2019, 0, 1));
  const [viewMode, setViewMode] = useState<ViewMode>('year');

  // Procesar datos de Firestore
  const processedData = useMemo(() => {
    if (!data?.array || !Array.isArray(data.array)) {
      return [];
    }
    return processFirestoreData(data.array);
  }, [data]);

  // Crear mapa de datos por fecha para acceso rápido O(1)
  const dataMap = useMemo(() => {
    return createDataMap(processedData);
  }, [processedData]);

  // Calcular datos del mes actual
  const monthData = useMemo((): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfWeek = getDay(monthStart); // 0 = Sunday, 6 = Saturday
    const today = new Date();

    const calendarDays: CalendarDay[] = [];

    // Días del mes anterior (para completar la primera semana)
    const prevMonth = subMonths(currentDate, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
      calendarDays.push({
        day,
        date,
        dailyReturn: null,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const key = format(date, 'yyyy-MM-dd');
      const dailyReturn = dataMap.get(key) ?? null;
      const isToday = isSameDay(date, today);

      calendarDays.push({
        day,
        date,
        dailyReturn,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Días del mes siguiente (para completar la última semana)
    const totalCells = calendarDays.length;
    const remainingCells = 42 - totalCells; // 6 semanas * 7 días

    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = addMonths(currentDate, 1);
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
      calendarDays.push({
        day,
        date,
        dailyReturn: null,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
      });
    }

    return calendarDays;
  }, [currentDate, dataMap]);

  // Calcular datos del año actual (totales mensuales)
  const yearData = useMemo((): CalendarMonth[] => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((month): CalendarMonth => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthReturns: number[] = [];
      processedData.forEach((item) => {
        if (item.date >= monthStart && item.date <= monthEnd) {
          monthReturns.push(item.dailyReturn);
        }
      });

      const totalReturn = monthReturns.reduce((sum, ret) => sum + ret, 0);

      return {
        month,
        totalReturn,
        daysCount: monthReturns.length,
      };
    });
  }, [currentDate, processedData]);

  // Calcular estadísticas del período
  const periodStats = useMemo((): PeriodStats => {
    if (viewMode === 'month') {
      const monthReturns = monthData
        .filter((day) => day.isCurrentMonth && day.dailyReturn !== null)
        .map((day) => day.dailyReturn as number);

      const total = monthReturns.reduce((sum, ret) => sum + ret, 0);
      const count = monthReturns.length;
      const average = count > 0 ? total / count : 0;

      return {
        total,
        average,
        count,
      };
    } else {
      const yearReturns = yearData
        .filter((month) => month.daysCount > 0)
        .map((month) => month.totalReturn);

      const total = yearReturns.reduce((sum, ret) => sum + ret, 0);
      const count = yearReturns.length;
      const average = count > 0 ? total / count : 0;

      return {
        total,
        average,
        count,
      };
    }
  }, [viewMode, monthData, yearData]);

  // Calcular totales de períodos desde el último valor recibido
  const periodTotals = useMemo(() => {
    if (processedData.length === 0) {
      return {
        today: null,
        sevenDays: null,
        thirtyDays: null,
        ninetyDays: null,
        oneEightyDays: null,
        oneYear: null,
      };
    }

    const lastDataPoint = processedData[processedData.length - 1];
    const lastDate = lastDataPoint.date;

    const calculatePeriodTotal = (daysBack: number): number | null => {
      const startDate = subDays(lastDate, daysBack - 1);
      const periodData = processedData.filter(
        (item) => item.date >= startDate && item.date <= lastDate
      );

      if (periodData.length === 0) return null;
      return periodData.reduce((sum, item) => sum + item.dailyReturn, 0);
    };

    return {
      today: lastDataPoint.dailyReturn,
      sevenDays: calculatePeriodTotal(7),
      thirtyDays: calculatePeriodTotal(30),
      ninetyDays: calculatePeriodTotal(90),
      oneEightyDays: calculatePeriodTotal(180),
      oneYear: calculatePeriodTotal(365),
    };
  }, [processedData]);

  // Navegación
  const handlePrevious = useCallback((): void => {
    if (viewMode === 'month') {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => subYears(prev, 1));
    }
  }, [viewMode]);

  const handleNext = useCallback((): void => {
    if (viewMode === 'month') {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addYears(prev, 1));
    }
  }, [viewMode]);

  return {
    loading,
    error,
    monthData,
    yearData,
    periodStats,
    periodTotals,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    handlePrevious,
    handleNext,
    formatReturn,
    getReturnClass,
  };
};

