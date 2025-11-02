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
      let apiKey = values.api_key;
      
      // For Generac, package OAuth tokens
      if (values.vendor === 'Generac') {
        // Create a JSON package with all OAuth data
        const oauthData = {
          user_id: values.generac_user_id,
          access_token: values.api_key,
          refresh_token: values.generac_refresh_token || null,
          expires_in: values.generac_expires_in ? parseInt(values.generac_expires_in) : null,
          token_type: 'Bearer',
          created_at: new Date().toISOString()
        };
        
        // Store as base64 encoded JSON in the api_key field
        apiKey = btoa(JSON.stringify(oauthData));
        
        message.loading('Adding Generac access...', 0);
      }
      
      await settingsApi.addApiKey(values.vendor, apiKey);
      message.destroy();
      message.success('Vendor access added successfully');
      setIsApiKeyModalOpen(false);
      apiKeyForm.resetFields();
      fetchApiKeys();
    } catch (error) {
      message.destroy();
      message.error('Failed to add vendor access');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    Modal.confirm({
      title: 'Delete Vendor Access',
      content: 'Are you sure you want to delete this vendor access?',
      onOk: async () => {
        try {
          await settingsApi.deleteApiKey(id);
          message.success('Vendor access deleted');
          fetchApiKeys();
        } catch (error) {
          message.error('Failed to delete vendor access');
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
      title: 'Credentials (Masked)',
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

      {/* Access Management */}
      <Card
        title={
          <Space>
            <KeyOutlined />
            <span>Access Management</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          Manage vendor access credentials for data integration.
        </Paragraph>

        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsApiKeyModalOpen(true)}
          >
            Add Vendor Access
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

      {/* Add Vendor Access Modal */}
      <Modal
        title="Add Vendor Access"
        open={isApiKeyModalOpen}
        onCancel={() => {
          setIsApiKeyModalOpen(false);
          apiKeyForm.resetFields();
        }}
        footer={null}
      >
        <Form 
          form={apiKeyForm} 
          layout="vertical" 
          onFinish={handleAddApiKey}
        >
          <Form.Item
            label="Vendor"
            name="vendor"
            rules={[{ required: true, message: 'Please select a vendor' }]}
          >
            <Select 
              placeholder="Select a vendor"
              onChange={() => apiKeyForm.setFieldsValue({ api_key: undefined })}
            >
              <Option value="SolarEdge">SolarEdge</Option>
              <Option value="Generac">Generac (PWRcell)</Option>
              <Option value="Enphase" disabled title="Not available yet">
                Enphase (Coming Soon)
              </Option>
              <Option value="Chint" disabled title="Not available yet">
                Chint (Coming Soon)
              </Option>
              <Option value="Tigo" disabled title="Not available yet">
                Tigo (Coming Soon)
              </Option>
              <Option value="CPS" disabled title="Not available yet">
                CPS (Coming Soon)
              </Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.vendor !== currentValues.vendor}>
            {({ getFieldValue }) => {
              const selectedVendor = getFieldValue('vendor');
              const isGenerac = selectedVendor === 'Generac';
              
              if (isGenerac) {
                // Generac uses OAuth tokens
                return (
                  <>
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                      To get your credentials: Log in to <a href="https://pwrfleet.generac.com" target="_blank" rel="noopener noreferrer">pwrfleet.generac.com</a>, 
                      open DevTools (F12) → Network tab → Find the "sites/paginated" request and copy the Fleet ID from the URL
                    </Paragraph>
                    
                    <Form.Item
                      label="Fleet ID"
                      name="generac_user_id"
                      rules={[{ required: true, message: 'Please enter your Fleet ID' }]}
                      tooltip="Found in the API URL: /fleets/v4/{THIS_ID}/sites/paginated"
                    >
                      <Input 
                        placeholder="e.g., 13c04608-ff34-4097-a6e3-0738072676d6" 
                        autoComplete="off"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      label="Access Token"
                      name="api_key"
                      rules={[{ required: true, message: 'Please enter your Access Token' }]}
                      tooltip="Found in the token response as 'accessToken'"
                    >
                      <Input.TextArea 
                        placeholder="Paste your access token here" 
                        autoComplete="off"
                        rows={3}
                      />
                    </Form.Item>
                    
                    <Form.Item
                      label="Refresh Token"
                      name="generac_refresh_token"
                      rules={[{ required: false }]}
                      tooltip="Found in the token response as 'refreshToken' - allows automatic token renewal"
                    >
                      <Input.TextArea 
                        placeholder="Paste your refresh token here (optional but recommended)" 
                        autoComplete="off"
                        rows={3}
                      />
                    </Form.Item>
                    
                    <Form.Item
                      label="Expires In (seconds)"
                      name="generac_expires_in"
                      rules={[{ required: false }]}
                      tooltip="Found in the token response as 'expiresIn' - typically 3600 (1 hour)"
                    >
                      <Input 
                        placeholder="e.g., 3600" 
                        autoComplete="off"
                        type="number"
                      />
                    </Form.Item>
                    
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      🔒 All tokens are encrypted and stored securely. Refresh token allows automatic renewal when access token expires.
                    </Text>
                  </>
                );
              } else {
                // Other vendors use API key
                return (
                  <Form.Item
                    label="API Key"
                    name="api_key"
                    rules={[{ required: true, message: 'Please enter your API key' }]}
                    tooltip="Your vendor API key for authentication"
                  >
                    <Input.Password 
                      placeholder="Enter your API key" 
                      autoComplete="off"
                    />
                  </Form.Item>
                );
              }
            }}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Access
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
