/**
 * Modos de visualización del calendario de retornos
 */
export type ViewMode = 'month' | 'year';

/**
 * Datos procesados de Firestore con fecha y retorno diario
 */
export interface DailyReturnData {
  date: Date;
  dailyReturn: number;
  timestamp: number;
}

/**
 * Representación de un día en el calendario mensual
 */
export interface CalendarDay {
  day: number;
  date: Date;
  dailyReturn: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Representación de un mes en la vista anual
 */
export interface CalendarMonth {
  month: Date;
  totalReturn: number;
  daysCount: number;
}

/**
 * Estadísticas del período actual (mes o año)
 */
export interface PeriodStats {
  total: number;
  average: number;
  count: number;
}

