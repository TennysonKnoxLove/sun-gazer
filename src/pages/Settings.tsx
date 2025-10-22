import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Space,
  Typography,
  Slider,
  Divider,
  message,
  Modal,
  Upload,
  ColorPicker,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  SyncOutlined,
  BgColorsOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { settingsApi } from '../services/api';
import type { ApiKey } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import dayjs from 'dayjs';
import './Settings.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [apiKeyForm] = Form.useForm();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const { settings, updateSettings } = useSettings();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        poll_interval_minutes: settings.polling.poll_interval_minutes,
        max_repolls: settings.polling.max_repolls,
        dashboard_ttl_minutes: settings.polling.dashboard_ttl_minutes,
        site_ttl_minutes: settings.polling.site_ttl_minutes,
        inactivity_timeout_minutes: settings.polling.inactivity_timeout_minutes,
        theme: settings.theme,
      });
    }
  }, [settings, form]);

  const fetchApiKeys = async () => {
    try {
      const data = await settingsApi.getApiKeys();
      setApiKeys(data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const handleAddApiKey = async (values: any) => {
    try {
      await settingsApi.addApiKey(values.vendor, values.api_key);
      message.success('API key added successfully');
      setIsApiKeyModalOpen(false);
      apiKeyForm.resetFields();
      fetchApiKeys();
    } catch (error) {
      message.error('Failed to add API key');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    Modal.confirm({
      title: 'Delete API Key',
      content: 'Are you sure you want to delete this API key?',
      onOk: async () => {
        try {
          await settingsApi.deleteApiKey(id);
          message.success('API key deleted');
          fetchApiKeys();
        } catch (error) {
          message.error('Failed to delete API key');
        }
      },
    });
  };

  const handleClearCache = async () => {
    Modal.confirm({
      title: 'Clear Cache',
      content: 'Are you sure you want to clear all cached data?',
      onOk: async () => {
        try {
          await settingsApi.clearCache();
          message.success('Cache cleared successfully');
        } catch (error) {
          message.error('Failed to clear cache');
        }
      },
    });
  };

  const handleExportData = async () => {
    try {
      const blob = await settingsApi.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sungazer-backup-${dayjs().format('YYYY-MM-DD')}.json`;
      a.click();
      message.success('Data exported successfully');
    } catch (error) {
      message.error('Failed to export data');
    }
  };

  const apiKeyColumns: ColumnsType<ApiKey> = [
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'Key (Masked)',
      dataIndex: 'key_masked',
      key: 'key_masked',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Last Used',
      dataIndex: 'last_used',
      key: 'last_used',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: ApiKey) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteApiKey(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="settings-page">
      <Title level={2}>Settings</Title>

      {/* API Keys Management */}
      <Card
        title={
          <Space>
            <KeyOutlined />
            <span>API Keys Management</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          Manage your vendor API keys for data integration.
        </Paragraph>

        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsApiKeyModalOpen(true)}
          >
            Add New API Key
          </Button>
        </div>

        <Table
          columns={apiKeyColumns}
          dataSource={apiKeys}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Polling & Caching */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Polling & Caching</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          Configure how data is fetched and stored. Changes apply immediately to active views.
        </Paragraph>

        <Form 
          form={form} 
          layout="vertical"
          onValuesChange={(changedValues) => {
            // Auto-save polling settings when changed
            if (Object.keys(changedValues).some(key => key.includes('minutes') || key.includes('repolls'))) {
              const pollingUpdate = {
                polling: {
                  poll_interval_minutes: form.getFieldValue('poll_interval_minutes'),
                  max_repolls: form.getFieldValue('max_repolls'),
                  dashboard_ttl_minutes: form.getFieldValue('dashboard_ttl_minutes'),
                  site_ttl_minutes: form.getFieldValue('site_ttl_minutes'),
                  inactivity_timeout_minutes: form.getFieldValue('inactivity_timeout_minutes'),
                }
              };
              updateSettings(pollingUpdate).then(() => {
                message.success('Polling settings updated');
              }).catch(() => {
                message.error('Failed to update settings');
              });
            }
          }}
        >
          <Form.Item
            label="Polling Interval"
            name="poll_interval_minutes"
            tooltip="How often to automatically refresh data while viewing a page"
          >
            <Slider min={5} max={60} marks={{ 5: '5m', 15: '15m', 30: '30m', 60: '60m' }} />
          </Form.Item>
          <Text type="secondary">
            Data will be refreshed every {form.getFieldValue('poll_interval_minutes') || 15} minutes while actively viewing a page.
          </Text>

          <Divider />

          <Form.Item
            label="Maximum Auto-Polls"
            name="max_repolls"
            tooltip="Maximum number of automatic refreshes before pausing"
          >
            <Slider min={1} max={10} marks={{ 1: '1', 3: '3', 5: '5', 10: '10' }} />
          </Form.Item>
          <Text type="secondary">
            After {form.getFieldValue('max_repolls') || 3} automatic refreshes, polling will pause until manual refresh.
          </Text>

          <Divider />

          <Form.Item
            label="Dashboard Cache TTL"
            name="dashboard_ttl_minutes"
            tooltip="How long dashboard data is considered fresh"
          >
            <Slider min={15} max={120} marks={{ 15: '15m', 45: '45m', 60: '1h', 120: '2h' }} />
          </Form.Item>

          <Form.Item
            label="Site Details Cache TTL"
            name="site_ttl_minutes"
            tooltip="How long individual site data is considered fresh"
          >
            <Slider min={5} max={60} marks={{ 5: '5m', 15: '15m', 30: '30m', 60: '1h' }} />
          </Form.Item>

          <Form.Item
            label="Inactivity Timeout"
            name="inactivity_timeout_minutes"
            tooltip="Pause polling after this many minutes of inactivity"
          >
            <Slider min={1} max={15} marks={{ 1: '1m', 5: '5m', 10: '10m', 15: '15m' }} />
          </Form.Item>

          <Divider />

          <Button icon={<SyncOutlined />} onClick={handleClearCache}>
            Clear Cache
          </Button>
        </Form>
      </Card>

      {/* Backup & Export/Import */}
      <Card
        title={
          <Space>
            <DownloadOutlined />
            <span>Backup & Export/Import</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          Manage application data and configurations.
        </Paragraph>

        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportData}>
            Backup Data Now
          </Button>
          <Button icon={<DownloadOutlined />}>Export Configuration</Button>
          <Upload
            accept=".json"
            showUploadList={false}
            customRequest={async ({ file }) => {
              try {
                await settingsApi.importData(file as File);
                message.success('Data imported successfully');
              } catch (error) {
                message.error('Failed to import data');
              }
            }}
          >
            <Button icon={<UploadOutlined />}>Import Data/Config</Button>
          </Upload>
        </Space>
      </Card>

      {/* App Updates */}
      <Card
        title={
          <Space>
            <InfoCircleOutlined />
            <span>App Updates</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          Keep your application up-to-date.
        </Paragraph>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>Current Version: 1.2.0</Text>
          </div>
          <Button type="primary">Check for Updates</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card
        title={
          <Space>
            <BgColorsOutlined />
            <span>Appearance</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          Customize the look and feel of Sun Gazer.
        </Paragraph>

        <Form form={form} layout="vertical">
          <Form.Item label="Theme" name="theme">
            <Select style={{ width: 200 }}>
              <Option value="light">Light</Option>
              <Option value="dark">Dark</Option>
              <Option value="system">System</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Accent Color">
            <ColorPicker defaultValue="#1890ff" />
          </Form.Item>
        </Form>
      </Card>

      {/* About & Support */}
      <Card
        title={
          <Space>
            <InfoCircleOutlined />
            <span>About & Support</span>
          </Space>
        }
      >
        <Paragraph type="secondary">
          Information about the application and how to get help.
        </Paragraph>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Paragraph>
              <strong>Application:</strong> Sun Gazer
            </Paragraph>
            <Paragraph>
              <strong>Contact Support:</strong>{' '}
              <a href="mailto:support@sungazer.com">support@sungazer.com</a>
            </Paragraph>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Paragraph>
              <strong>Version:</strong> 1.2.0 (Build 20240624)
            </Paragraph>
            <Paragraph>
              <strong>Documentation:</strong>{' '}
              <a href="#" target="_blank" rel="noopener noreferrer">
                View Online Docs
              </a>
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Add API Key Modal */}
      <Modal
        title="Add New API Key"
        open={isApiKeyModalOpen}
        onCancel={() => {
          setIsApiKeyModalOpen(false);
          apiKeyForm.resetFields();
        }}
        footer={null}
      >
        <Form form={apiKeyForm} layout="vertical" onFinish={handleAddApiKey}>
          <Form.Item
            label="Vendor"
            name="vendor"
            rules={[{ required: true, message: 'Please select a vendor' }]}
          >
            <Select placeholder="Select a vendor">
              <Option value="SolarEdge">SolarEdge</Option>
              <Option value="Enphase">Enphase</Option>
              <Option value="Generac" disabled title="Coming Soon">
                Generac (Coming Soon)
              </Option>
              <Option value="Tigo" disabled title="Coming Soon">
                Tigo (Coming Soon)
              </Option>
              <Option value="CPS" disabled title="Coming Soon - Partner onboarding required">
                CPS (Coming Soon)
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="API Key"
            name="api_key"
            rules={[{ required: true, message: 'Please enter your API key' }]}
          >
            <Input.Password placeholder="Enter your API key" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Key
              </Button>
              <Button onClick={() => {
                setIsApiKeyModalOpen(false);
                apiKeyForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
