import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useRiskChart } from '../../hooks/risk/useRiskChart';
import {
  formatReturnPercent,
  getBarColor,
  formatYAxisTick,
} from '../../utils/riskChart';
import './styles.css';
import { RISK_CHART_STYLES } from './chart.styles';

const RiskChart = () => {
  const {
    loading,
    error,
    filteredData,
    xAxisTicks,
    statistics,
    selectedTimeframe,
    setSelectedTimeframe,
    timeframes,
    formatXAxisTick,
  } = useRiskChart('user1');

  if (loading) {
    return (
      <div className="risk-chart-loading-container">
        <div className="risk-chart-loading-content">
          <div className="risk-chart-spinner"></div>
          <p className="risk-chart-loading-text">Cargando análisis de riesgo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="risk-chart-error-container">
        <div className="risk-chart-error-content">
          <p className="risk-chart-error-title">Error al cargar datos</p>
          <p className="risk-chart-error-message">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="risk-chart-no-data">
        <p>No hay datos suficientes para el análisis de riesgo</p>
      </div>
    );
  }

  return (
    <div className="risk-chart-container">
      <div className="risk-chart-header">
        <h2 className="risk-chart-title">Análisis de Riesgo-Volatilidad</h2>
        <p className="risk-chart-subtitle">
          Retornos diarios a lo largo del tiempo
        </p>
      </div>

      <div className="risk-chart-statistics">
        <div className="risk-chart-stat-item">
          <p className="risk-chart-stat-label">Retorno promedio</p>
          <p className={`risk-chart-stat-value ${
            statistics.meanReturn >= 0 ? 'positive' : 'negative'
          }`}>
            {formatReturnPercent(statistics.meanReturn)}
          </p>
        </div>
        
        <div className="risk-chart-stat-item">
          <p className="risk-chart-stat-label">Volatilidad</p>
          <p className="risk-chart-stat-value">
            {formatReturnPercent(statistics.volatility)}
          </p>
        </div>
        
        <div className="risk-chart-stat-item">
          <p className="risk-chart-stat-label">Retorno mínimo</p>
          <p className="risk-chart-stat-value negative">
            {formatReturnPercent(statistics.minReturn)}
          </p>
        </div>
        
        <div className="risk-chart-stat-item">
          <p className="risk-chart-stat-label">Retorno máximo</p>
          <p className="risk-chart-stat-value positive">
            {formatReturnPercent(statistics.maxReturn)}
          </p>
        </div>
        
        <div className="risk-chart-stat-item">
          <p className="risk-chart-stat-label">Total de días</p>
          <p className="risk-chart-stat-value">
            {statistics.totalReturns}
          </p>
        </div>
      </div>

      <div className="risk-chart-interpretation">
        {statistics.volatility > 0.05 ? (
          <div className="risk-chart-warning">
            <p className="risk-chart-warning-text">
              ⛔️ Alta volatilidad detectada. Este portafolio presenta un riesgo significativo.
            </p>
          </div>
        ) : statistics.volatility < 0.02 ? (
          <div className="risk-chart-stable">
            <p className="risk-chart-stable-text">
              ✅ Baja volatilidad. Portafolio relativamente estable.
            </p>
          </div>
        ) : (
          <div className="risk-chart-moderate">
            <p className="risk-chart-moderate-text">
              ⚠️ Volatilidad moderada. Portafolio con riesgo medio.
            </p>
          </div>
        )}
      </div>

      <div className="risk-chart-evolution-section">
        <h2 className="risk-chart-evolution-title">Evolución de Retornos</h2>

        {/* Selector de período */}
        <div className="risk-chart-period-selector">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              className={`risk-chart-period-button ${
                selectedTimeframe === timeframe.value ? 'active' : ''
              }`}
              onClick={() => setSelectedTimeframe(timeframe.value)}
            >
              {timeframe.label}
            </button>
          ))}
        </div>

        <div className="risk-chart-wrapper">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={filteredData}
                margin={RISK_CHART_STYLES.margin}
              >
                <CartesianGrid
                  strokeDasharray={RISK_CHART_STYLES.grid.strokeDasharray}
                  stroke={RISK_CHART_STYLES.grid.stroke}
                  vertical={false}
                />
                <ReferenceLine
                  y={0}
                  stroke={RISK_CHART_STYLES.referenceLine.stroke}
                  strokeWidth={RISK_CHART_STYLES.referenceLine.strokeWidth}
                  strokeDasharray={RISK_CHART_STYLES.referenceLine.strokeDasharray}
                />
                <XAxis
                  dataKey="date"
                  stroke={RISK_CHART_STYLES.axis.stroke}
                  style={RISK_CHART_STYLES.axis.style}
                  tick={{ fill: RISK_CHART_STYLES.axis.stroke }}
                  ticks={selectedTimeframe === '24h' ? [] : (xAxisTicks.length > 0 ? xAxisTicks : undefined)}
                  tickFormatter={formatXAxisTick}
                  interval={selectedTimeframe === '24h' ? 'preserveStartEnd' : 0}
                  minTickGap={selectedTimeframe === '24h' ? 40 : selectedTimeframe === '1M' ? 50 : 30}
                />
                <YAxis
                  stroke={RISK_CHART_STYLES.axis.stroke}
                  style={RISK_CHART_STYLES.axis.style}
                  tick={{ fill: RISK_CHART_STYLES.axis.stroke }}
                  tickFormatter={formatYAxisTick}
                  label={{ 
                    value: 'Retorno diario (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                  domain={[-0.01, 0.01]}
                  ticks={[-0.01, 0.01]}
                />
                <Tooltip
                  contentStyle={RISK_CHART_STYLES.tooltip}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) {
                      return null;
                    }

                    const data = payload[0].payload;
                    return (
                      <div className="risk-chart-tooltip">
                        <p className="risk-chart-tooltip-label">{data.date}</p>
                        <p className={`risk-chart-tooltip-value ${
                          data.isPositive ? 'positive' : 'negative'
                        }`}>
                          <strong>Retorno diario:</strong> {formatReturnPercent(data.dailyReturn)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="dailyReturn" radius={[4, 4, 0, 0]}>
                  {filteredData.map((point, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(point.dailyReturn)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="risk-chart-no-data">
              <p>No hay datos disponibles para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskChart;
