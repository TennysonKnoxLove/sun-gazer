// Vendor types (imported from vendors.ts - single source of truth)
import type { Vendor } from '../utils/vendors';
export type { Vendor } from '../utils/vendors';

// Site status
export type SiteStatus = 'Online' | 'Offline' | 'Warning' | 'Maintenance';

// Alert severity
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

// Alert status
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

// Site interface
export interface Site {
  id: string;
  name: string;
  vendor: Vendor;
  vendor_site_id: string;
  status: SiteStatus;
  peak_power_kw: number;
  current_power_kw: number;
  daily_production_kwh: number;
  health_score: number;
  address: {
    street?: string;
    city: string;
    state: string;
    zip?: string;
  };
  last_updated: string;
}

// Device interface
export interface Device {
  id: string;
  site_id: string;
  vendor: Vendor;
  vendor_device_id: string;
  device_type: 'inverter' | 'microinverter' | 'panel' | 'battery' | 'meter';
  model: string;
  manufacturer: string;
  serial_number: string;
  status: 'Online' | 'Offline' | 'Warning';
  last_reported: string;
}

// Alert interface
export interface Alert {
  id: string;
  site_id: string;
  site_name: string;
  device_id?: string;
  vendor: Vendor;
  severity: AlertSeverity;
  code: string;
  description: string;
  status: AlertStatus;
  timestamp: string;
}

// Timeseries metric
export interface TimeseriesMetric {
  timestamp: string;
  value: number;
  metric_name: string;
}

// Power Flow data (SolarEdge)
export interface PowerFlow {
  site_id: string;
  site_name: string;
  supported: boolean;
  pv_power_kw: number;
  load_power_kw: number;
  grid_power_kw: number;
  storage_power_kw: number;
  storage_level_percent: number;
  status: string;
  last_update: string | null;
  unit: string;
}

// API Key
export interface ApiKey {
  id: string;
  vendor: Vendor;
  key_masked: string;
  created: string;
  last_used: string;
}

// Dashboard stats
export interface DashboardStats {
  total_sites: number;
  online_sites: number;
  sites_with_alerts: number;
  total_production_today_kwh: number;
  change_from_yesterday: number;
  uptime_percentage: number;
  new_alerts_this_week: number;
}

// Polling configuration
export interface PollingConfig {
  dashboard_ttl_minutes: number;
  site_ttl_minutes: number;
  poll_interval_minutes: number;
  max_repolls: number;
  inactivity_timeout_minutes: number;
}

// Settings
export interface Settings {
  polling: PollingConfig;
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
}

