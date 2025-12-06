export interface DailyReturnDataPoint {
    date: string; // Fecha formateada para mostrar
    dailyReturn: number; // Retorno diario en decimal (ej: 0.05 = 5%)
    timestamp: number; // Timestamp en milisegundos
    isPositive: boolean; // true si dailyReturn >= 0
}
  
export interface RiskStatistics {
    totalReturns: number;
    meanReturn: number;
    volatility: number; // Desviación estándar
    minReturn: number;
    maxReturn: number;
}
  
export interface RiskChartData {
    dataPoints: DailyReturnDataPoint[];
    statistics: RiskStatistics;
}