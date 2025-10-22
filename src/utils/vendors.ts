/**
 * Vendor configuration and availability
 * This is the single source of truth for all vendor definitions
 */

export interface VendorInfo {
  name: string;
  available: boolean;
  comingSoon?: boolean;
  description?: string;
}

export const AVAILABLE_VENDORS = ['SolarEdge', 'Enphase'] as const;
export const COMING_SOON_VENDORS = ['Generac', 'Tigo', 'CPS'] as const;

// Derive the Vendor type from the actual vendor arrays
export type Vendor = typeof AVAILABLE_VENDORS[number] | typeof COMING_SOON_VENDORS[number];

export const VENDOR_CONFIG: Record<string, VendorInfo> = {
  SolarEdge: {
    name: 'SolarEdge',
    available: true,
    description: 'Official API with 300 requests/day limit'
  },
  Enphase: {
    name: 'Enphase',
    available: true,
    description: 'OAuth 2.0 authentication required'
  },
  Generac: {
    name: 'Generac',
    available: false,
    comingSoon: true,
    description: 'Coming soon - Session-based scraping'
  },
  Tigo: {
    name: 'Tigo',
    available: false,
    comingSoon: true,
    description: 'Coming soon - Premium subscription required'
  },
  CPS: {
    name: 'CPS',
    available: false,
    comingSoon: true,
    description: 'Coming soon - Partner onboarding required'
  },
};

export const isVendorAvailable = (vendor: string): boolean => {
  return VENDOR_CONFIG[vendor]?.available ?? false;
};

export const getVendorInfo = (vendor: string): VendorInfo | undefined => {
  return VENDOR_CONFIG[vendor];
};

