export const CHART_STYLES = {
    margin: { top: 20, right: 50, left: 50, bottom: 20 },
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
    line: { stroke: '#8532d9', strokeWidth: 2 },
    contributionsLine: { stroke: '#9CA3AF', strokeWidth: 2 },
    ma7Line: { stroke: '#FCD34D', strokeWidth: 2, strokeDasharray: '5 5' }, // Amarillo
    ma25Line: { stroke: '#F472B6', strokeWidth: 2, strokeDasharray: '5 5' }, // Rosado
    ma99Line: { stroke: '#18daae', strokeWidth: 2, strokeDasharray: '5 5' }, // Verde/Cyan
    activeDot: { r: 6, fill: '#8532d9', strokeWidth: 2, stroke: '#fff' },
    contributionsActiveDot: { r: 6, fill: '#9CA3AF', strokeWidth: 2, stroke: '#fff' },
    ma7ActiveDot: { r: 5, fill: '#FCD34D', strokeWidth: 2, stroke: '#fff' },
    ma25ActiveDot: { r: 5, fill: '#F472B6', strokeWidth: 2, stroke: '#fff' },
    ma99ActiveDot: { r: 5, fill: '#18daae', strokeWidth: 2, stroke: '#fff' },
    area: {
      fillOpacity: 0.2,
      gradientId: 'profitGradient',
      gradientColors: {
        start: 'rgba(133, 50, 217, 0.3)',
        end: 'rgba(133, 50, 217, 0.1)',
      },
    },
};