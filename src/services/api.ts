import axios from 'axios';
import type {
  Site,
  Alert,
  Device,
  DashboardStats,
  ApiKey,
  Settings,
  TimeseriesMetric,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard endpoints
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
  
  refresh: async (): Promise<void> => {
    await api.post('/api/dashboard/refresh');
  },
};

// Sites endpoints
export const sitesApi = {
  getAll: async (): Promise<Site[]> => {
    const response = await api.get('/api/sites');
    return response.data;
  },
  
  getById: async (id: string): Promise<Site> => {
    const response = await api.get(`/api/sites/${id}`);
    return response.data;
  },
  
  getOverview: async (id: string): Promise<any> => {
    const response = await api.get(`/api/sites/${id}/overview`);
    return response.data;
  },
  
  getEnergy: async (id: string, period?: string): Promise<TimeseriesMetric[]> => {
    const response = await api.get(`/api/sites/${id}/energy`, {
      params: { period },
    });
    return response.data;
  },
  
  getDevices: async (id: string): Promise<Device[]> => {
    const response = await api.get(`/api/sites/${id}/devices`);
    return response.data;
  },
  
  getLayout: async (id: string): Promise<Device[]> => {
    const response = await api.get(`/api/sites/${id}/layout`);
    return response.data;
  },
  
  refresh: async (id: string, resource?: string): Promise<void> => {
    await api.post(`/api/sites/${id}/refresh`, { resource });
  },
};

// Alerts endpoints
export const alertsApi = {
  getAll: async (filters?: {
    vendor?: string;
    severity?: string;
    status?: string;
  }): Promise<Alert[]> => {
    const response = await api.get('/api/alerts', { params: filters });
    return response.data;
  },
  
  getBySite: async (siteId: string): Promise<Alert[]> => {
    const response = await api.get(`/api/sites/${siteId}/alerts`);
    return response.data;
  },
  
  acknowledge: async (id: string): Promise<void> => {
    await api.patch(`/api/alerts/${id}/acknowledge`);
  },
  
  resolve: async (id: string): Promise<void> => {
    await api.patch(`/api/alerts/${id}/resolve`);
  },
};

// Settings endpoints
export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await api.get('/api/settings');
    return response.data;
  },
  
  update: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await api.patch('/api/settings', settings);
    return response.data;
  },
  
  getApiKeys: async (): Promise<ApiKey[]> => {
    const response = await api.get('/api/settings/api-keys');
    return response.data;
  },
  
  addApiKey: async (vendor: string, key: string): Promise<ApiKey> => {
    const response = await api.post('/api/settings/api-keys', { vendor, key });
    return response.data;
  },
  
  deleteApiKey: async (id: string): Promise<void> => {
    await api.delete(`/api/settings/api-keys/${id}`);
  },
  
  clearCache: async (): Promise<void> => {
    await api.post('/api/settings/clear-cache');
  },
  
  exportData: async (): Promise<Blob> => {
    const response = await api.get('/api/settings/export', {
      responseType: 'blob',
    });
    return response.data;
  },
  
  importData: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/api/settings/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;

