import type { NameType, Payload } from 'recharts/types/component/DefaultTooltipContent';

/**
 * Calcula la ganancia/pérdida basada en el valor del portafolio y las contribuciones
 */
export const calculateProfit = (
  portfolioValue: number | undefined,
  contributions: number | undefined
): number | null => {
  if (portfolioValue === undefined || contributions === undefined) {
    return null;
  }
  return portfolioValue - contributions;
};

/**
 * Formatea un número como moneda chilena
 */
export const formatCurrency = (
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return value.toLocaleString('es-CL', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

/**
 * Formatea valores del eje Y del gráfico
 */
export const formatYAxisTick = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${formatCurrency(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Filtra payloads duplicados del tooltip de Recharts
 */
export const filterUniquePayloads = <T extends Payload<number, NameType>>(
  payload: readonly T[]
): T[] => {
  const seenDataKeys = new Set<string | number>();
  return payload.filter((entry) => {
    const dataKey = entry.dataKey;
    if (seenDataKeys.has(dataKey as string | number)) {
      return false;
    }
    seenDataKeys.add(dataKey as string | number);
    return true;
  });
};

/**
 * Obtiene el nombre legible para un dataKey del gráfico
 */
export const getDataKeyLabel = (dataKey: string | number | undefined): string => {
  if (dataKey === 'contributions') {
    return 'Contribuciones';
  }
  if (dataKey === 'value') {
    return 'Valor del portafolio';
  }
  return String(dataKey ?? '');
};

/**
 * Obtiene el valor de un payload por su dataKey
 */
export const getPayloadValue = <T extends Payload<number, NameType>>(
  payloads: readonly T[],
  dataKey: string | number
): number | undefined => {
  return payloads.find((entry) => entry.dataKey === dataKey)?.value as
    | number
    | undefined;
};

/**
 * Formatea ganancia/pérdida con signo y estilo
 */
export const formatProfit = (profit: number): {
  label: string;
  formattedValue: string;
  color: string;
} => {
  const isPositive = profit >= 0;
  return {
    label: isPositive ? 'Ganancias' : 'Pérdidas',
    formattedValue: `${isPositive ? '+' : ''}$${formatCurrency(profit)}`,
    color: isPositive ? '#059669' : '#DC2626',
  };
};

