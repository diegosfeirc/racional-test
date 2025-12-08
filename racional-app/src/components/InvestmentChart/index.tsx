import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import { useInvestmentChart } from '../../hooks/investment/useInvestmentChart';
import {
  calculateProfit,
  formatCurrency,
  formatYAxisTick,
  filterUniquePayloads,
  getDataKeyLabel,
  getPayloadValue,
  formatProfit,
} from '../../utils/investmentChart';
import './styles.css';
import { CHART_STYLES } from './chart.styles';

const InvestmentChart = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const {
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
        <h2 className="chart-title">Evolución del Portafolio</h2>
        <div className="chart-summary">
          <div className="chart-summary-item">
            <div className="chart-summary-content">
              <p className="chart-summary-label">Valor Portafolio</p>
              <p 
                className="chart-summary-value"
                style={{ color: CHART_STYLES.line.stroke }}
              >
                ${formatCurrency(currentValue)}
              </p>
            </div>
          </div>
          
          <div className="chart-summary-item">
            <div className="chart-summary-content">
              <p className="chart-summary-label">Total Depósitos</p>
              <p 
                className="chart-summary-value"
                style={{ color: CHART_STYLES.contributionsLine.stroke }}
              >
                ${formatCurrency(currentContributions)}
              </p>
            </div>
          </div>
          
          <div className="chart-summary-item">
            <div className="chart-summary-content">
              <p className="chart-summary-label">Ganancias</p>
              <p className={`chart-summary-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                {totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}
              </p>
            </div>
          </div>
          
          <div className="chart-summary-item">
            <div className="chart-summary-content">
              <p className="chart-summary-label">Retorno total</p>
              <p className={`chart-summary-value ${parseFloat(returnPercent) >= 0 ? 'positive' : 'negative'}`}>
                {returnPercent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-evolution-section">
        {/* Selector de período - Desktop */}
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
        
        {/* Selector de período - Mobile */}
        <select
          className="chart-period-select"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as typeof selectedTimeframe)}
        >
          {timeframes.map((timeframe) => (
            <option key={timeframe.value} value={timeframe.value}>
              {timeframe.label}
            </option>
          ))}
        </select>

        <div className="chart-wrapper">
          {filteredChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={filteredChartData}
                margin={isMobile 
                  ? { top: 20, right: 5, left: 25, bottom: 20 }
                  : CHART_STYLES.margin
                }
              >
                <defs>
                  <linearGradient id={CHART_STYLES.area.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_STYLES.area.gradientColors.start} />
                    <stop offset="100%" stopColor={CHART_STYLES.area.gradientColors.end} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                  stroke={CHART_STYLES.grid.stroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={CHART_STYLES.axis.stroke}
                  style={isMobile ? { fontSize: '10px' } : CHART_STYLES.axis.style}
                  tick={{ fill: CHART_STYLES.axis.stroke, fontSize: isMobile ? 10 : 12 }}
                  ticks={selectedTimeframe === '24h' ? [] : (xAxisTicks.length > 0 ? xAxisTicks : undefined)}
                  tickFormatter={formatXAxisTick}
                  interval={selectedTimeframe === '24h' ? 'preserveStartEnd' : 0}
                  minTickGap={
                    isMobile
                      ? selectedTimeframe === '24h'
                        ? 40
                        : selectedTimeframe === '1M' || selectedTimeframe === 'MTD'
                        ? 60
                        : selectedTimeframe === 'YTD'
                        ? 80
                        : 50
                      : selectedTimeframe === '24h' 
                      ? 40 
                      : selectedTimeframe === '1M' || selectedTimeframe === 'MTD'
                      ? 50 
                      : selectedTimeframe === 'YTD'
                      ? 60
                      : 30
                  }
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={CHART_STYLES.axis.stroke}
                  style={isMobile ? { fontSize: '10px' } : CHART_STYLES.axis.style}
                  tick={{ fill: CHART_STYLES.axis.stroke, fontSize: isMobile ? 9 : 12 }}
                  tickFormatter={(value) => {
                    if (isMobile) {
                      // Formato más compacto para móviles
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(1)}M`;
                      }
                      if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}k`;
                      }
                      return `$${Math.round(value)}`;
                    }
                    return formatYAxisTick(value);
                  }}
                  domain={['auto', 'auto']}
                  width={isMobile ? 28 : 50}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.tooltip}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) {
                      return null;
                    }

                    const uniquePayloads = filterUniquePayloads(payload);
                    const portfolioValue = getPayloadValue(uniquePayloads, 'value');
                    const contributions = getPayloadValue(uniquePayloads, 'contributions');
                    const profit = calculateProfit(portfolioValue, contributions);

                    return (
                      <div className="chart-tooltip">
                        <p className="chart-tooltip-label">{label}</p>
                        {uniquePayloads.map((entry, index) => {
                          if (!entry.value || typeof entry.value !== 'number') return null;
                          
                          const value = entry.value as number;
                          const name = getDataKeyLabel(entry.dataKey);
                          
                          return (
                            <p 
                              key={index} 
                              className="chart-tooltip-entry"
                              style={{ color: entry.color }}
                            >
                              <strong>{name}:</strong> ${formatCurrency(value)}
                            </p>
                          );
                        })}
                        {profit !== null && (
                          <p 
                            className="chart-tooltip-profit"
                            style={{ color: formatProfit(profit).color }}
                          >
                            <strong>{formatProfit(profit).label}:</strong>{' '}
                            {formatProfit(profit).formattedValue}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill={`url(#${CHART_STYLES.area.gradientId})`}
                  fillOpacity={CHART_STYLES.area.fillOpacity}
                  legendType="none"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Total Inversiones"
                  stroke={CHART_STYLES.line.stroke}
                  strokeWidth={CHART_STYLES.line.strokeWidth}
                  dot={false}
                  activeDot={CHART_STYLES.activeDot}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="contributions"
                  name="Total Depósitos"
                  stroke={CHART_STYLES.contributionsLine.stroke}
                  strokeWidth={CHART_STYLES.contributionsLine.strokeWidth}
                  dot={false}
                  activeDot={CHART_STYLES.contributionsActiveDot}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-no-data">
              <p>No hay datos disponibles para el período seleccionado</p>
            </div>
          )}
        </div>
        
        {/* Leyenda fuera del wrapper del gráfico */}
        {filteredChartData.length > 0 && (
          <ul className="chart-legend-list">
            <li className="chart-legend-item">
              <svg width="14" height="14" className="chart-legend-icon">
                <line x1="0" y1="7" x2="14" y2="7" stroke={CHART_STYLES.line.stroke} strokeWidth="2" />
              </svg>
              <span className="chart-legend-text" style={{ color: CHART_STYLES.line.stroke }}>
                Valor Portafolio
              </span>
            </li>
            <li className="chart-legend-item">
              <svg width="14" height="14" className="chart-legend-icon">
                <line x1="0" y1="7" x2="14" y2="7" stroke={CHART_STYLES.contributionsLine.stroke} strokeWidth="2" />
              </svg>
              <span className="chart-legend-text">Total Depósitos</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default InvestmentChart;

