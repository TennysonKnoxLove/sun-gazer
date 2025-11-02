import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

/**
 * Smart energy formatter - automatically chooses best unit and precision
 * Shows Wh for values < 1 kWh, kWh for values < 1000 kWh, MWh for larger values
 */
export const formatEnergy = (value: number, unit: 'kWh' | 'MWh' = 'kWh'): string => {
  if (unit === 'MWh') {
    return `${(value / 1000).toFixed(2)} MWh`;
  }
  return `${value.toFixed(2)} kWh`;
};

/**
 * Smart energy formatter with adaptive units based on magnitude
 * - Shows Wh for values < 1 kWh (better for small production)
 * - Shows kWh with appropriate decimals for 1-1000 kWh
 * - Shows MWh for values >= 1000 kWh
 */
export const formatEnergyAdaptive = (kwh: number): string => {
  if (kwh < 0.001) {
    // Less than 1 Wh - show as 0 Wh
    return '0 Wh';
  } else if (kwh < 1) {
    // Less than 1 kWh - show in Wh with no decimals
    const wh = kwh * 1000;
    return `${Math.round(wh)} Wh`;
  } else if (kwh < 10) {
    // 1-10 kWh - show 2 decimals
    return `${kwh.toFixed(2)} kWh`;
  } else if (kwh < 100) {
    // 10-100 kWh - show 1 decimal
    return `${kwh.toFixed(1)} kWh`;
  } else if (kwh < 1000) {
    // 100-1000 kWh - show whole number
    return `${Math.round(kwh)} kWh`;
  } else {
    // >= 1000 kWh - show in MWh with 2 decimals
    const mwh = kwh / 1000;
    return `${mwh.toFixed(2)} MWh`;
  }
};

/**
 * Smart power formatter - automatically chooses best unit and precision
 * - Shows W for values < 1 kW (better for low production)
 * - Shows kW with appropriate decimals for >= 1 kW
 * - Shows MW for values >= 1000 kW
 */
export const formatPower = (value: number): string => {
  return `${value.toFixed(2)} kW`;
};

/**
 * Smart power formatter with adaptive units based on magnitude
 * - Shows W for values < 1 kW (better for low or no production)
 * - Shows kW with appropriate decimals for 1-1000 kW
 * - Shows MW for values >= 1000 kW
 */
export const formatPowerAdaptive = (kw: number): string => {
  if (kw < 0.001) {
    // Less than 1 W - show as 0 W
    return '0 W';
  } else if (kw < 1) {
    // Less than 1 kW - show in W with no decimals
    const w = kw * 1000;
    return `${Math.round(w)} W`;
  } else if (kw < 10) {
    // 1-10 kW - show 2 decimals
    return `${kw.toFixed(2)} kW`;
  } else if (kw < 100) {
    // 10-100 kW - show 1 decimal
    return `${kw.toFixed(1)} kW`;
  } else if (kw < 1000) {
    // 100-1000 kW - show whole number
    return `${Math.round(kw)} kW`;
  } else {
    // >= 1000 kW - show in MW with 2 decimals
    const mw = kw / 1000;
    return `${mw.toFixed(2)} MW`;
  }
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const formatDuration = (minutes: number): string => {
  const dur = dayjs.duration(minutes, 'minutes');
  
  if (dur.asHours() >= 24) {
    return `${Math.floor(dur.asDays())}d ${dur.hours()}h`;
  } else if (dur.asHours() >= 1) {
    return `${dur.hours()}h ${dur.minutes()}m`;
  } else {
    return `${dur.minutes()}m`;
  }
};

export const maskApiKey = (key: string): string => {
  if (key.length <= 8) {
    return '***' + key.slice(-4);
  }
  return '***********' + key.slice(-6);
};

export const calculateHealthScore = (
  onlineDevices: number,
  totalDevices: number,
  alertCount: number
): number => {
  if (totalDevices === 0) return 100;
  
  const deviceRatio = onlineDevices / totalDevices;
  const baseScore = deviceRatio * 100;
  const alertPenalty = Math.min(alertCount * 5, 30);
  
  return Math.max(0, Math.min(100, baseScore - alertPenalty));
};

