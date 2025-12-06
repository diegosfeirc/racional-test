import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useVolatilityCalendar } from '../../hooks/volatility/useVolatilityCalendar';
import './styles.css';

const VolatilityCalendar = () => {
  const {
    loading,
    error,
    monthData,
    yearData,
    periodStats,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    handlePrevious,
    handleNext,
    formatReturn,
    getReturnClass,
  } = useVolatilityCalendar('user1');

  if (loading) {
    return (
      <div className="volatility-calendar-loading">
        <div className="volatility-calendar-spinner"></div>
        <p>Cargando datos de volatilidad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volatility-calendar-error">
        <p className="error-title">Error al cargar datos</p>
        <p className="error-message">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="volatility-calendar">
      <div className="volatility-calendar-header">
        <div className="volatility-calendar-title-section">
          <h2 className="volatility-calendar-title">Retornos Diarios y Mensuales</h2>
          <div className="volatility-calendar-view-toggle">
            <button
              className={`view-toggle-button ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
              aria-label="Vista mensual"
              type="button"
            >
              Mes
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'year' ? 'active' : ''}`}
              onClick={() => setViewMode('year')}
              aria-label="Vista anual"
              type="button"
            >
              Año
            </button>
          </div>
        </div>

        <div className="volatility-calendar-stats">
          <div className="volatility-calendar-stat-item">
            <span className="stat-label">
              {viewMode === 'month' ? 'Mes' : 'Año'} Total PNL
            </span>
            <span className={`stat-value ${getReturnClass(periodStats.total)}`}>
              {formatReturn(periodStats.total)}
            </span>
          </div>
          <div className="volatility-calendar-stat-item">
            <span className="stat-label">Promedio</span>
            <span className={`stat-value ${getReturnClass(periodStats.average)}`}>
              {formatReturn(periodStats.average)}
            </span>
          </div>
          <div className="volatility-calendar-stat-item">
            <span className="stat-label">Días con datos</span>
            <span className="stat-value">{periodStats.count}</span>
          </div>
        </div>
      </div>

      <div className="volatility-calendar-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          aria-label="Período anterior"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h3 className="volatility-calendar-period">
          {viewMode === 'month'
            ? format(currentDate, 'MMMM yyyy', { locale: es })
            : format(currentDate, 'yyyy')}
        </h3>

        <button
          className="nav-button"
          onClick={handleNext}
          aria-label="Período siguiente"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M8 4L14 10L8 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {viewMode === 'month' ? (
        <div className="volatility-calendar-month-view">
          <div className="calendar-weekdays">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-grid">
            {monthData.map((calendarDay, index) => (
              <div
                key={`${calendarDay.date.getTime()}-${index}`}
                className={`calendar-day ${!calendarDay.isCurrentMonth ? 'other-month' : ''} ${
                  calendarDay.isToday ? 'today' : ''
                }`}
              >
                <div className="calendar-day-number">{calendarDay.day}</div>
                {calendarDay.dailyReturn !== null && (
                  <div
                    className={`calendar-day-return ${getReturnClass(calendarDay.dailyReturn)}`}
                  >
                    {formatReturn(calendarDay.dailyReturn)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="volatility-calendar-year-view">
          <div className="year-grid">
            {yearData.map((monthData) => (
              <div
                key={format(monthData.month, 'yyyy-MM')}
                className="year-month-card"
                onClick={() => {
                  setCurrentDate(monthData.month);
                  setViewMode('month');
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="year-month-header">
                  {format(monthData.month, 'MMM', { locale: es })}
                </div>
                <div
                  className={`year-month-return ${getReturnClass(monthData.averageReturn)}`}
                >
                  {formatReturn(monthData.averageReturn)}
                </div>
                <div className="year-month-days">
                  {monthData.daysCount} {monthData.daysCount === 1 ? 'día' : 'días'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolatilityCalendar;
