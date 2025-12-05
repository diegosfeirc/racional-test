import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useInvestmentChart } from '../../hooks/investment/useInvestmentChart';
import './styles.css';
import { CHART_STYLES } from './chart.styles';

const InvestmentChart = () => {
  const {
    loading,
    error,
    filteredChartData,
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
  } = useInvestmentChart('user1');

  if (loading) {
    return (
      <div className="chart-loading-container">
        <div className="chart-loading-content">
          <div className="chart-spinner"></div>
          <p className="chart-loading-text">Cargando datos de inversión...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error-container">
        <div className="chart-error-content">
          <p className="chart-error-title">Error al cargar datos</p>
          <p className="chart-error-message">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-summary">
          <div className="chart-summary-item">
            <div className="chart-summary-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 16.5C4.5 16.5 6 18 8 18C10 18 11.5 16.5 11.5 16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 13L12 2L18 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 13H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="chart-summary-content">
              <p className="chart-summary-label">Total inversiones</p>
              <p className="chart-summary-value">
                ${currentValue.toLocaleString('es-CL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          
          <div className="chart-summary-item">
            <div className="chart-summary-content">
              <p className="chart-summary-label">Ganancias/Pérdidas</p>
              <p className={`chart-summary-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString('es-CL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          
          <div className="chart-summary-item">
            <div className="chart-summary-content">
              <p className="chart-summary-label">Variación reciente</p>
              <p className={`chart-summary-value ${recentChange >= 0 ? 'positive' : 'negative'}`}>
                {recentChange >= 0 ? '+' : ''}${recentChange.toLocaleString('es-CL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ({recentChange >= 0 ? '+' : ''}{recentChangePercent}%)
              </p>
            </div>
          </div>
          
          <div className="chart-summary-item">
            <div className="chart-summary-content">
              <p className="chart-summary-label">Retorno en el tiempo</p>
              <p className={`chart-summary-value ${parseFloat(returnPercent) >= 0 ? 'positive' : 'negative'}`}>
                {returnPercent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-evolution-section">
        <h2 className="chart-evolution-title">Evolución</h2>

        {/* Selector de período */}
        <div className="chart-period-selector">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              className={`chart-period-button ${
                selectedTimeframe === timeframe.value ? 'active' : ''
              }`}
              onClick={() => setSelectedTimeframe(timeframe.value)}
            >
              {timeframe.label}
            </button>
          ))}
        </div>

        <div className="chart-wrapper">
          {filteredChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={filteredChartData}
                margin={CHART_STYLES.margin}
              >
                <CartesianGrid
                  strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                  stroke={CHART_STYLES.grid.stroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={CHART_STYLES.axis.stroke}
                  style={{ fontSize: CHART_STYLES.axis.fontSize }}
                  tick={{ fill: CHART_STYLES.axis.stroke }}
                  ticks={selectedTimeframe === '24h' ? [] : (xAxisTicks.length > 0 ? xAxisTicks : undefined)}
                  tickFormatter={formatXAxisTick}
                  interval={selectedTimeframe === '24h' ? 'preserveStartEnd' : 0}
                  minTickGap={selectedTimeframe === '24h' ? 40 : selectedTimeframe === '1M' ? 50 : 30}
                />
                <YAxis
                  stroke={CHART_STYLES.axis.stroke}
                  style={{ fontSize: CHART_STYLES.axis.fontSize }}
                  tick={{ fill: CHART_STYLES.axis.stroke }}
                  tickFormatter={(value: number): string => {
                    if (value >= 1000) {
                      return `$${(value / 1000).toFixed(1)}k`;
                    }
                    return `$${value.toLocaleString('es-CL', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`;
                  }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.tooltip}
                  formatter={(value: number): [string, string] => [
                    `$${value.toLocaleString('es-CL', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    'Total portafolio',
                  ]}
                  labelFormatter={(label: string) => label}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_STYLES.line.stroke}
                  strokeWidth={CHART_STYLES.line.strokeWidth}
                  dot={false}
                  activeDot={CHART_STYLES.activeDot}
                  connectNulls={false}
                />
                <Line
                  type="linear"
                  dataKey="regressionValue"
                  stroke={CHART_STYLES.regressionLine.stroke}
                  strokeWidth={CHART_STYLES.regressionLine.strokeWidth}
                  dot={false}
                  strokeDasharray={CHART_STYLES.regressionLine.strokeDasharray}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-no-data">
              <p>No hay datos disponibles para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentChart;

