import { Badge } from 'antd';
import type { PresetStatusColorType } from 'antd/es/_util/colors';

interface StatusBadgeProps {
  status: string;
  text?: string;
}

const getStatusColor = (status: string): PresetStatusColorType => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('online') || statusLower.includes('success') || statusLower.includes('resolved')) {
    return 'success';
  }
  
  if (statusLower.includes('offline') || statusLower.includes('error') || statusLower.includes('critical') || statusLower.includes('active')) {
    return 'error';
  }
  
  if (statusLower.includes('warning') || statusLower.includes('acknowledged')) {
    return 'warning';
  }
  
  return 'default';
};

const StatusBadge = ({ status, text }: StatusBadgeProps) => {
  return <Badge status={getStatusColor(status)} text={text || status} />;
};

export default StatusBadge;

