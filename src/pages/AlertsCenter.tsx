import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Badge,
} from 'antd';
import {
  ReloadOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { alertsApi } from '../services/api';
import type { Alert, AlertSeverity, AlertStatus } from '@/types';
import dayjs from 'dayjs';
import './AlertsCenter.css';

const { Title, Text } = Typography;

const AlertsCenter = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    vendor: 'all',
    severity: 'all',
    status: 'all',
  });
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertsApi.getAll({
        vendor: filters.vendor !== 'all' ? filters.vendor : undefined,
        severity: filters.severity !== 'all' ? filters.severity : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      });
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await alertsApi.acknowledge(id);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertsApi.resolve(id);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'red';
      case 'Warning':
        return 'orange';
      case 'Info':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'Active':
        return 'error';
      case 'Acknowledged':
        return 'warning';
      case 'Resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Alert> = [
    {
      title: 'Site Name',
      dataIndex: 'site_name',
      key: 'site_name',
      render: (text: string, record: Alert) => (
        <a onClick={() => navigate(`/sites/${record.site_id}`)}>{text}</a>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: AlertSeverity) => (
        <Tag color={getSeverityColor(severity)}>{severity}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AlertStatus) => (
        <Badge status={getStatusColor(status)} text={status} />
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record: Alert) => (
        <Space size="small">
          {record.status === 'Active' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleAcknowledge(record.id)}
            >
              Ack
            </Button>
          )}
          {record.status !== 'Resolved' && (
            <Button
              type="link"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleResolve(record.id)}
            >
              Resolve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="alerts-center">
      <div className="alerts-header">
        <Title level={2}>Alerts Center</Title>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="middle">
            <Text strong>Filter by:</Text>
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
              value={filters.severity}
              onChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <Select.Option value="all">All Severities</Select.Option>
              <Select.Option value="Critical">Critical</Select.Option>
              <Select.Option value="Warning">Warning</Select.Option>
              <Select.Option value="Info">Info</Select.Option>
            </Select>
            <Select
              style={{ width: 150 }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Acknowledged">Acknowledged</Select.Option>
              <Select.Option value="Resolved">Resolved</Select.Option>
            </Select>
          </Space>
          <Space>
            <Text strong>Sort by:</Text>
            <Select style={{ width: 150 }} value={sortBy} onChange={setSortBy}>
              <Select.Option value="date">Date (Newest)</Select.Option>
              <Select.Option value="severity">Severity</Select.Option>
            </Select>
          </Space>
        </div>
      </Card>

      {/* Actions Bar */}
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAlerts} loading={loading}>
            Refresh
          </Button>
          <Button icon={<ExportOutlined />}>Export Alerts</Button>
        </Space>
      </div>

      {/* Alerts Table */}
      <Card title="All Alerts">
        <Table
          columns={columns}
          dataSource={alerts}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} alerts`,
          }}
          locale={{
            emptyText: 'No Alerts Yet',
          }}
        />
      </Card>
    </div>
  );
};

export default AlertsCenter;

