import { Tag } from 'antd';
import { VENDOR_COLORS } from '../../utils/constants';
import type { Vendor } from '../../types';

interface VendorTagProps {
  vendor: Vendor;
}

const VendorTag = ({ vendor }: VendorTagProps) => {
  return (
    <Tag color={VENDOR_COLORS[vendor] || 'default'}>
      {vendor}
    </Tag>
  );
};

export default VendorTag;

