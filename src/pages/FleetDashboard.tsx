import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Badge,
  Typography,
  Button,
  Space,
  Progress,
  Pagination,
  Alert,
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useMachine } from '@xstate/react';
import { pollingMachine } from '../machines/pollingMachine';
import { dashboardApi, sitesApi, settingsApi } from '../services/api';
import type { Site, DashboardStats } from '../types';
import { formatPowerAdaptive, formatEnergyAdaptive } from '../utils/formatters';
import './FleetDashboard.css';

const { Title, Text } = Typography;

const FleetDashboard = () => {
  const navigate = useNavigate();
  const [state, send] = useMachine(pollingMachine);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    vendor: 'all',
    status: 'all',
    score: 'all',
  });
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    checkApiKeys();
    fetchDashboard();
    send({ type: 'START_POLLING', intervalMs: 15 * 60 * 1000, maxPolls: 3 });

    return () => {
      send({ type: 'STOP_POLLING' });
    };
  }, []);

  useEffect(() => {
    fetchSites();
  }, [currentPage, pageSize, filters.vendor, filters.status]);

  const checkApiKeys = async () => {
    try {
      const apiKeys = await settingsApi.getApiKeys();
      setHasApiKey(apiKeys && apiKeys.length > 0);
    } catch (error) {
      console.error('Failed to check API keys:', error);
      setHasApiKey(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const statsData = await dashboardApi.getStats();
      setStats(statsData);
      await fetchSites();
      send({ type: 'FETCH_SUCCESS' });
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      send({ type: 'FETCH_ERROR', error: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (filters.vendor !== 'all') {
        params.vendor = filters.vendor;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const data = await sitesApi.getAll(params);
      setSites(data.sites);
      setTotalCount(data.pagination.total_count);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const handleRefresh = async () => {
    await fetchDashboard();
    send({ type: 'MANUAL_REFRESH' });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const filteredSites = sites.filter((site) => {
    if (filters.score !== 'all') {
      if (filters.score === 'high' && site.health_score < 90) return false;
      if (filters.score === 'medium' && (site.health_score < 70 || site.health_score >= 90))
        return false;
      if (filters.score === 'low' && site.health_score >= 70) return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'success';
      case 'Offline':
        return 'error';
      case 'Warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="fleet-dashboard">
      <div className="dashboard-header">
        <Title level={2}>Fleet Overview</Title>
        <Space>
          {state.matches('paused') && (
            <Text type="secondary">Auto-refresh paused</Text>
          )}
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* API Key Warning */}
      {!hasApiKey && (
        <Alert
          message="No API Key Configured"
          description={
            <span>
              Your API key is missing or invalid. The data shown may be outdated. 
              To view the most recent data, please{' '}
              <a onClick={() => navigate('/settings')}>add a valid API key in Settings</a>.
            </span>
          }
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle">
          <Text strong>Filters:</Text>
          <Select
            style={{ width: 150 }}
            value={filters.vendor}
            onChange={(value) => setFilters({ ...filters, vendor: value })}
          >
            <Select.Option value="all">All Vendors</Select.Option>
            <Select.Option value="SolarEdge">SolarEdge</Select.Option>
            <Select.Option value="Enphase">Enphase</Select.Option>
            <Select.Option value="Generac" disabled title="Coming Soon">
              Generac (Coming Soon)
            </Select.Option>
            <Select.Option value="Tigo" disabled title="Coming Soon">
              Tigo (Coming Soon)
            </Select.Option>
            <Select.Option value="CPS" disabled title="Coming Soon">
              CPS (Coming Soon)
            </Select.Option>
          </Select>
          <Select
            style={{ width: 150 }}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="Online">Online</Select.Option>
            <Select.Option value="Offline">Offline</Select.Option>
            <Select.Option value="Warning">Warning</Select.Option>
          </Select>
          <Select
            style={{ width: 150 }}
            value={filters.score}
            onChange={(value) => setFilters({ ...filters, score: value })}
          >
            <Select.Option value="all">All Scores</Select.Option>
            <Select.Option value="high">High (90+)</Select.Option>
            <Select.Option value="medium">Medium (70-89)</Select.Option>
            <Select.Option value="low">Low (&lt;70)</Select.Option>
          </Select>
          <Select
            style={{ width: 150 }}
            value={sortBy}
            onChange={setSortBy}
            prefix="Sort by:"
          >
            <Select.Option value="name">Site Name</Select.Option>
            <Select.Option value="production">Production</Select.Option>
            <Select.Option value="health">Health Score</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Sites"
              value={stats?.total_sites || 0}
              prefix={<DashboardOutlined />}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {stats?.total_sites && stats.total_sites > 0
                    ? `+1 in last month`
                    : ''}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Online Sites"
              value={stats?.online_sites || 0}
              prefix={<ThunderboltOutlined />}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {stats?.uptime_percentage
                    ? `${stats.uptime_percentage}% uptime`
                    : ''}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sites with Alerts"
              value={stats?.sites_with_alerts || 0}
              prefix={<AlertOutlined />}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {stats?.new_alerts_this_week
                    ? `${stats.new_alerts_this_week} new this week`
                    : ''}
                </Text>
              }
              valueStyle={{ color: stats?.sites_with_alerts ? '#cf1322' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                <ThunderboltOutlined style={{ marginRight: 4 }} />
                Total Production (Today)
              </Text>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}>
              {formatEnergyAdaptive(stats?.total_production_today_kwh || 0)}
            </div>
            {stats?.change_from_yesterday !== undefined && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {stats.change_from_yesterday > 0 ? (
                    <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#cf1322' }} />
                  )}
                  {' '}
                  {Math.abs(stats.change_from_yesterday)}% vs. yesterday
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Sites Grid */}
      <Row gutter={[16, 16]}>
        {filteredSites.map((site) => (
          <Col xs={24} sm={12} lg={8} key={site.id}>
            <Card
              hoverable
              onClick={() => navigate(`/sites/${site.id}`)}
              className="site-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {site.name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {site.vendor}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Progress
                    type="circle"
                    percent={site.health_score}
                    width={50}
                    strokeColor={
                      site.health_score >= 90
                        ? '#52c41a'
                        : site.health_score >= 70
                        ? '#faad14'
                        : '#f5222d'
                    }
                  />
                </div>
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <ThunderboltOutlined />
                  <Badge status={getStatusColor(site.status)} text={site.status} />
                </div>

                <div className="site-metrics">
                  <div>
                    <Text type="secondary">Daily Production:</Text>
                    <br />
                    <Text strong>{formatEnergyAdaptive(site.daily_production_kwh)}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Current Power:</Text>
                    <br />
                    <Text strong>{formatPowerAdaptive(site.current_power_kw)}</Text>
                  </div>
                </div>

                <div>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  <Text type="secondary">
                    {site.address.city}, {site.address.state}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredSites.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <Text type="secondary">No sites match the current filters</Text>
        </Card>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onChange={handlePageChange}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} sites`}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      )}
    </div>
  );
};

export default FleetDashboard;

