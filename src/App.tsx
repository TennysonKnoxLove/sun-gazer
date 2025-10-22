import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { SettingsProvider } from './contexts/SettingsContext';
import AppLayout from './components/layout/AppLayout';
import FleetDashboard from './pages/FleetDashboard';
import AlertsCenter from './pages/AlertsCenter';
import Settings from './pages/Settings';
import SiteDetails from './pages/SiteDetails';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<FleetDashboard />} />
            <Route path="alerts" element={<AlertsCenter />} />
            <Route path="settings" element={<Settings />} />
            <Route path="sites/:siteId" element={<SiteDetails />} />
          </Route>
        </Routes>
      </Layout>
    </SettingsProvider>
  );
}

export default App;
