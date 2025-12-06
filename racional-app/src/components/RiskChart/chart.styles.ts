export const RISK_CHART_STYLES = {
  margin: { top: 20, right: 30, left: 50, bottom: 80 },
  grid: { strokeDasharray: '3 3', stroke: '#E5E7EB' },
  axis: { 
    stroke: '#6B7280', 
    fontSize: '12px',
    style: { fontSize: '12px' },
  },
  tooltip: {
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  bar: {
    positive: '#059669', // Verde para retornos positivos
    negative: '#DC2626', // Rojo para retornos negativos
  },
  referenceLine: {
    stroke: '#6B7280',
    strokeWidth: 1,
    strokeDasharray: '5 5',
  },
};

