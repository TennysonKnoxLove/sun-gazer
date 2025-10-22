import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Space,
  Typography,
  Table,
  Tag,
  Badge,
  Descriptions,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  AlertOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sitesApi, alertsApi } from '../services/api';
import type { Site, Device, Alert, TimeseriesMetric } from '../types';
import dayjs from 'dayjs';
import './SiteDetails.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const SiteDetails = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [energyData, setEnergyData] = useState<TimeseriesMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (siteId) {
      fetchSiteData();
    }
  }, [siteId]);

  const fetchSiteData = async () => {
    if (!siteId) return;
    
    setLoading(true);
    try {
      const [siteData, devicesData, alertsData, energyData] = await Promise.all([
        sitesApi.getById(siteId),
        sitesApi.getDevices(siteId),
        alertsApi.getBySite(siteId),
        sitesApi.getEnergy(siteId, 'day'),
      ]);
      
      setSite(siteData);
      setDevices(devicesData);
      setAlerts(alertsData);
      setEnergyData(energyData);
    } catch (error) {
      console.error('Failed to fetch site data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (siteId) {
      try {
        await sitesApi.refresh(siteId);
        await fetchSiteData();
      } catch (error) {
        console.error('Failed to refresh site:', error);
      }
    }
  };

  const deviceColumns: ColumnsType<Device> = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
    },
    {
      title: 'Type',
      dataIndex: 'device_type',
      key: 'device_type',
      render: (type: string) => type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Online' ? 'success' : status === 'Offline' ? 'error' : 'warning';
        return <Badge status={color} text={status} />;
      },
    },
    {
      title: 'Last Reported',
      dataIndex: 'last_reported',
      key: 'last_reported',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const alertColumns: ColumnsType<Alert> = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const color = severity === 'Critical' ? 'red' : severity === 'Warning' ? 'orange' : 'blue';
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Active' ? 'error' : status === 'Acknowledged' ? 'warning' : 'success';
        return <Badge status={color} text={status} />;
      },
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  if (!site) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Empty description="Site not found" />
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const chartData = energyData.map((metric) => ({
    time: dayjs(metric.timestamp).format('HH:mm'),
    power: metric.value,
  }));

  return (
    <div className="site-details">
      {/* Header */}
      <div className="site-header">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
          >
            Back
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Site Detail - {site.name}
          </Title>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          <Row gutter={[24, 24]}>
            {/* Left Column - Site Info */}
            <Col xs={24} lg={12}>
              <Card title={`${site.name} (Operational)`} className="site-info-card">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    <Text>
                      {site.address.street && `${site.address.street}, `}
                      {site.address.city}, {site.address.state}
                      {site.address.zip && ` ${site.address.zip}`}
                    </Text>
                  </div>

                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Vendor">{site.vendor}</Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                      {dayjs(site.last_updated).format('YYYY-MM-DD HH:mm A')}
                    </Descriptions.Item>
                  </Descriptions>

                  <Button type="default" icon={<EnvironmentOutlined />}>
                    View on Map
                  </Button>
                </Space>
              </Card>

              {/* Site Location Map Placeholder */}
              <Card
                title="Site Location"
                style={{ marginTop: 24 }}
                bodyStyle={{ padding: 0, height: 300, background: '#f0f0f0' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#999',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <EnvironmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>Map Integration</div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Right Column - KPIs */}
            <Col xs={24} lg={12}>
              <Card title="Site Health" className="health-card">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Progress
                    type="circle"
                    percent={site.health_score}
                    width={150}
                    strokeColor={
                      site.health_score >= 90
                        ? '#52c41a'
                        : site.health_score >= 70
                        ? '#faad14'
                        : '#f5222d'
                    }
                  />
                </div>
              </Card>

              <Card title="Key Performance Indicators" style={{ marginTop: 24 }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Total Production Today"
                      value={site.daily_production_kwh}
                      suffix="kWh"
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Current Power"
                      value={site.current_power_kw}
                      suffix="kW"
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Daily Yield"
                      value="4.20"
                      suffix="kWh/kWp"
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Lifetime Energy"
                      value="2.50"
                      suffix="MWh"
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <AppstoreOutlined />
              Devices
            </span>
          }
          key="devices"
        >
          <Card>
            <Table
              columns={deviceColumns}
              dataSource={devices}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <AlertOutlined />
              Alerts
            </span>
          }
          key="alerts"
        >
          <Card>
            <Table
              columns={alertColumns}
              dataSource={alerts}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: 'No active alerts for this site',
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              Energy/Production
            </span>
          }
          key="energy"
        >
          <Card title="Power Production Today">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Today's Production"
                  value={site.daily_production_kwh}
                  suffix="kWh"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="This Week"
                  value={(site.daily_production_kwh * 7).toFixed(0)}
                  suffix="kWh"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="This Month"
                  value={(site.daily_production_kwh * 30).toFixed(0)}
                  suffix="kWh"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Panel Schematic
            </span>
          }
          key="schematic"
        >
          <Card>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              <strong>Note:</strong> This is a schematic representation based on device data.
              It may not reflect the exact physical layout.
            </Paragraph>

            <div className="panel-grid">
              {devices
                .filter((d) => d.device_type === 'panel' || d.device_type === 'microinverter')
                .slice(0, 20)
                .map((device) => (
                  <Card
                    key={device.id}
                    size="small"
                    className={`panel-card ${device.status.toLowerCase()}`}
                  >
                    <div style={{ fontSize: 12, textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold' }}>{device.serial_number}</div>
                      <Badge
                        status={
                          device.status === 'Online'
                            ? 'success'
                            : device.status === 'Offline'
                            ? 'error'
                            : 'warning'
                        }
                        text={device.status}
                      />
                    </div>
                  </Card>
                ))}
            </div>

            {devices.filter((d) => d.device_type === 'panel' || d.device_type === 'microinverter')
              .length === 0 && (
              <Empty description="No panel data available" />
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              History/Timeline
            </span>
          }
          key="history"
        >
          <Card>
            <Empty description="Timeline feature coming soon" />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Notes/Aliases
            </span>
          }
          key="notes"
        >
          <Card>
            <Empty description="Notes feature coming soon" />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SiteDetails;
