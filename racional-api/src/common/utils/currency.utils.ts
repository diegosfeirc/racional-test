/**
 * Utilidades para conversión entre dólares y centavos
 * Todos los montos se almacenan en centavos (enteros) en la base de datos
 * pero la API trabaja con dólares (números decimales)
 */

/**
 * Convierte dólares a centavos (enteros)
 * @param dollars - Monto en dólares (ej: 150.50)
 * @returns Monto en centavos (ej: 15050)
 * @throws Error si el valor no es un número válido
 */
export function dollarsToCents(dollars: number): bigint {
  // Validar que sea un número válido
  if (typeof dollars !== 'number' || isNaN(dollars)) {
    throw new Error('Invalid dollar amount: must be a valid number');
  }

  // Validar que no sea infinito
  if (!isFinite(dollars)) {
    throw new Error('Invalid dollar amount: cannot be infinite');
  }

  // Redondear a 2 decimales y convertir a centavos
  // Multiplicamos por 100 y redondeamos para evitar errores de punto flotante
  const rounded = Math.round(dollars * 100);
  return BigInt(rounded);
}

/**
 * Convierte centavos (enteros) a dólares
 * @param cents - Monto en centavos (ej: 15050)
 * @returns Monto en dólares (ej: 150.50)
 */
export function centsToDollars(cents: bigint | number): number {
  const centsNumber = typeof cents === 'bigint' ? Number(cents) : cents;
  return centsNumber / 100;
}

