import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings, PollingConfig } from '../types';
import { settingsApi } from '../services/api';

interface SettingsContextType {
  settings: Settings | null;
  pollingConfig: PollingConfig | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.get();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      console.error('Failed to fetch settings:', err);
      
      // Fallback to default settings if backend fails
      setSettings({
        polling: {
          dashboard_ttl_minutes: 45,
          site_ttl_minutes: 15,
          poll_interval_minutes: 15,
          max_repolls: 3,
          inactivity_timeout_minutes: 5,
        },
        theme: 'system',
        accent_color: '#1890ff',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updated = await settingsApi.update(newSettings);
      setSettings(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        pollingConfig: settings?.polling || null,
        loading,
        error,
        updateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

