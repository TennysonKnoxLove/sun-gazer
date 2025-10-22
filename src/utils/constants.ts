// NOTE: Some of this stuff may be returned to us from API calls and may not need to be defined here.

export const VENDORS = [
  'SolarEdge',
  'Enphase',
  'Generac',
  'Tigo',
  'CPS',
] as const;

export const SITE_STATUSES = [
  'Online',
  'Offline',
  'Warning',
  'Maintenance',
] as const;

export const ALERT_SEVERITIES = [
  'Critical',
  'Warning',
  'Info',
] as const;

export const ALERT_STATUSES = [
  'Active',
  'Acknowledged',
  'Resolved',
] as const;

export const POLLING_CONFIG = {
  DASHBOARD_TTL_MINUTES: 45,
  SITE_TTL_MINUTES: 15,
  POLL_INTERVAL_MINUTES: 15,
  MAX_REPOLLS: 3,
  INACTIVITY_TIMEOUT_MINUTES: 5,
  STOP_NOTICE_DELAY_MINUTES: 1,
};

export const VENDOR_COLORS: Record<string, string> = {
  SolarEdge: '#1890ff',
  Enphase: '#52c41a',
  Generac: '#faad14',
  Tigo: '#722ed1',
  CPS: '#eb2f96',
};

export const STATUS_COLORS: Record<string, string> = {
  Online: '#52c41a',
  Offline: '#f5222d',
  Warning: '#faad14',
  Maintenance: '#1890ff',
};

export const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#f5222d',
  Warning: '#faad14',
  Info: '#1890ff',
};

