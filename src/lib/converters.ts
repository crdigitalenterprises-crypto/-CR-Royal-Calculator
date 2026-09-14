export type ConverterCategory = 'length' | 'weight' | 'temperature' | 'currency';

export interface UnitDef {
  code: string;
  name: string;
  factor: number;
}

export const LENGTH_UNITS: UnitDef[] = [
  { code: 'm', name: 'Meter', factor: 1 },
  { code: 'km', name: 'Kilometer', factor: 1000 },
  { code: 'cm', name: 'Centimeter', factor: 0.01 },
  { code: 'mm', name: 'Millimeter', factor: 0.001 },
  { code: 'mi', name: 'Mile', factor: 1609.344 },
  { code: 'ft', name: 'Foot', factor: 0.3048 },
  { code: 'in', name: 'Inch', factor: 0.0254 },
  { code: 'yd', name: 'Yard', factor: 0.9144 },
  { code: 'nmi', name: 'Nautical Mile', factor: 1852 },
];

export const WEIGHT_UNITS: UnitDef[] = [
  { code: 'kg', name: 'Kilogram', factor: 1000 },
  { code: 'g', name: 'Gram', factor: 1 },
  { code: 'mg', name: 'Milligram', factor: 0.001 },
  { code: 't', name: 'Tonne', factor: 1000000 },
  { code: 'lb', name: 'Pound', factor: 453.592 },
  { code: 'oz', name: 'Ounce', factor: 28.3495 },
  { code: 'st', name: 'Stone', factor: 6350.29 },
  { code: 'ct', name: 'Carat', factor: 0.2 },
];

export const TEMPERATURE_UNITS: UnitDef[] = [
  { code: 'C', name: 'Celsius', factor: 1 },
  { code: 'F', name: 'Fahrenheit', factor: 1 },
  { code: 'K', name: 'Kelvin', factor: 1 },
];

export const CURRENCY_UNITS: UnitDef[] = [
  { code: 'USD', name: 'US Dollar', factor: 1 },
  { code: 'EUR', name: 'Euro', factor: 0.92 },
  { code: 'GBP', name: 'British Pound', factor: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', factor: 149.50 },
  { code: 'CNY', name: 'Chinese Yuan', factor: 7.24 },
  { code: 'CAD', name: 'Canadian Dollar', factor: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', factor: 1.52 },
  { code: 'CHF', name: 'Swiss Franc', factor: 0.88 },
  { code: 'INR', name: 'Indian Rupee', factor: 83.25 },
  { code: 'KRW', name: 'South Korean Won', factor: 1340 },
  { code: 'BRL', name: 'Brazilian Real', factor: 5.04 },
  { code: 'MXN', name: 'Mexican Peso', factor: 17.12 },
  { code: 'SGD', name: 'Singapore Dollar', factor: 1.35 },
  { code: 'HKD', name: 'Hong Kong Dollar', factor: 7.82 },
  { code: 'NZD', name: 'New Zealand Dollar', factor: 1.64 },
  { code: 'SEK', name: 'Swedish Krona', factor: 10.58 },
  { code: 'NOK', name: 'Norwegian Krone', factor: 10.72 },
  { code: 'DKK', name: 'Danish Krone', factor: 6.88 },
  { code: 'PLN', name: 'Polish Zloty', factor: 4.02 },
  { code: 'TRY', name: 'Turkish Lira', factor: 31.45 },
  { code: 'ZAR', name: 'South African Rand', factor: 18.68 },
  { code: 'AED', name: 'UAE Dirham', factor: 3.67 },
  { code: 'THB', name: 'Thai Baht', factor: 35.80 },
  { code: 'RUB', name: 'Russian Ruble', factor: 92.50 },
];

export function getUnitsForCategory(category: ConverterCategory): UnitDef[] {
  switch (category) {
    case 'length': return LENGTH_UNITS;
    case 'weight': return WEIGHT_UNITS;
    case 'temperature': return TEMPERATURE_UNITS;
    case 'currency': return CURRENCY_UNITS;
  }
}

export function convertLength(value: number, fromCode: string, toCode: string): number {
  const fromUnit = LENGTH_UNITS.find((u) => u.code === fromCode);
  const toUnit = LENGTH_UNITS.find((u) => u.code === toCode);
  if (!fromUnit || !toUnit) return NaN;
  return (value * fromUnit.factor) / toUnit.factor;
}

export function convertWeight(value: number, fromCode: string, toCode: string): number {
  const fromUnit = WEIGHT_UNITS.find((u) => u.code === fromCode);
  const toUnit = WEIGHT_UNITS.find((u) => u.code === toCode);
  if (!fromUnit || !toUnit) return NaN;
  return (value * fromUnit.factor) / toUnit.factor;
}

export function convertTemperature(value: number, fromCode: string, toCode: string): number {
  let celsius: number;
  switch (fromCode) {
    case 'C': celsius = value; break;
    case 'F': celsius = (value - 32) * 5 / 9; break;
    case 'K': celsius = value - 273.15; break;
    default: return NaN;
  }
  switch (toCode) {
    case 'C': return celsius;
    case 'F': return celsius * 9 / 5 + 32;
    case 'K': return celsius + 273.15;
    default: return NaN;
  }
}

export function convertCurrency(value: number, fromCode: string, toCode: string): number {
  const fromUnit = CURRENCY_UNITS.find((u) => u.code === fromCode);
  const toUnit = CURRENCY_UNITS.find((u) => u.code === toCode);
  if (!fromUnit || !toUnit) return NaN;
  const usd = value / fromUnit.factor;
  return usd * toUnit.factor;
}

export function convert(value: number, category: ConverterCategory, fromCode: string, toCode: string): number {
  switch (category) {
    case 'length': return convertLength(value, fromCode, toCode);
    case 'weight': return convertWeight(value, fromCode, toCode);
    case 'temperature': return convertTemperature(value, fromCode, toCode);
    case 'currency': return convertCurrency(value, fromCode, toCode);
  }
}

export function formatConvertedValue(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 1e9 || abs < 1e-6) return value.toExponential(4);
  if (abs >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (abs >= 1) return value.toFixed(4).replace(/\.?0+$/, '');
  return value.toFixed(6).replace(/\.?0+$/, '');
}
