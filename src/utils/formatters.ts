import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export const formatEnergy = (value: number, unit: 'kWh' | 'MWh' = 'kWh'): string => {
  if (unit === 'MWh') {
    return `${(value / 1000).toFixed(2)} MWh`;
  }
  return `${value.toFixed(2)} kWh`;
};

export const formatPower = (value: number): string => {
  return `${value.toFixed(2)} kW`;
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

