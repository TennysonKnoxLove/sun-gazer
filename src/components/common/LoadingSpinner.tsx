import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullscreen?: boolean;
}

const LoadingSpinner = ({ size = 'default', tip, fullscreen = false }: LoadingSpinnerProps) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24 }} spin />;

  if (fullscreen) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <Spin indicator={antIcon} size={size} tip={tip} />
      </div>
    );
  }

  return <Spin indicator={antIcon} size={size} tip={tip} />;
};

export default LoadingSpinner;

