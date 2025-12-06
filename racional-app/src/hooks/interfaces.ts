import type { ChartDataPoint, InvestmentEvolution } from "../types/investment.types";
import type { Timeframe } from "./investment/useInvestmentChart";

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