import type { ChartDataPoint, InvestmentEvolution } from "../types/investment.types";
import type { Timeframe } from "./investment/useInvestmentChart";
import type { ViewMode, CalendarDay, CalendarMonth, PeriodStats } from "../types/returns.types";

// INVESTMENT CHART
export interface UseInvestmentChartReturn {
    // Data
    loading: boolean;
    error: Error | null;
    filteredChartData: ChartDataPoint[];
    xAxisTicks: string[];
    
    // Statistics
    currentValue: number;
    totalGain: number;
    currentContributions: number;
    returnPercent: string;
    
    // Timeframe
    selectedTimeframe: Timeframe;
    setSelectedTimeframe: (timeframe: Timeframe) => void;
    timeframes: { value: Timeframe; label: string }[];
    
    // Formatters
    formatXAxisTick: (value: string) => string;
}

// INVESTMENT EVOLUTION
export interface UseInvestmentEvolutionReturn {
    data: InvestmentEvolution | null;
    loading: boolean;
    error: Error | null;
}

// RETURNS CALENDAR
export interface UseReturnsCalendarReturn {
    // Data
    loading: boolean;
    error: Error | null;
    monthData: CalendarDay[];
    yearData: CalendarMonth[];
    periodStats: PeriodStats;
    periodTotals: {
        today: number | null;
        sevenDays: number | null;
        thirtyDays: number | null;
        ninetyDays: number | null;
        oneEightyDays: number | null;
        oneYear: number | null;
    };
    
    // View mode
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    
    // Navigation
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    handlePrevious: () => void;
    handleNext: () => void;
    
    // Formatters
    formatReturn: (value: number | null) => string;
    getReturnClass: (value: number | null) => string;
}