# SunGazer Quick Start Guide

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file in the root directory:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Development
NODE_ENV=development
```

### 3. Run the Application

#### Development Mode

```bash
# Option 1: Run both Vite dev server and Electron together
npm run electron:dev

# Option 2: Run separately (in different terminals)
npm run dev      # Terminal 1
electron .       # Terminal 2 (after Vite starts)
```

The application will open automatically in an Electron window.

## Backend Setup

The frontend requires a Python backend to be running. See the backend repository for setup instructions.

Quick backend setup:

```bash
# In a separate directory
git clone <backend-repo-url>
cd sungazer-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn main:app --reload
```

The backend should be running at `http://localhost:8000` (or update `VITE_API_BASE_URL` accordingly).

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Main application views
│   ├── FleetDashboard.tsx
│   ├── AlertsCenter.tsx
│   ├── Settings.tsx
│   └── SiteDetails.tsx
├── services/        # API communication
├── machines/        # XState state machines
├── hooks/           # Custom React hooks
├── types/           # TypeScript definitions
└── utils/           # Utilities and constants
```

## Key Features

### Fleet Dashboard

- Overview of all solar sites
- Filter by vendor, status, and health score
- Real-time production metrics
- Quick navigation to individual sites

### Alerts Center

- Centralized alert management
- Filter by vendor, severity, and status
- Acknowledge and resolve alerts
- Export alerts to CSV

### Site Details

Multiple tabs for comprehensive site monitoring:

- **Overview**: Site info, health score, and KPIs
- **Devices**: Inventory of all equipment
- **Alerts**: Site-specific alerts
- **Energy/Production**: Charts and production data
- **Panel Schematic**: Visual layout of panels
- **History/Timeline**: Activity log
- **Notes/Aliases**: Custom annotations

### Settings

- API key management for each vendor
- Polling and caching configuration
- Theme and appearance customization
- Backup and export/import
- App updates

## Configuration

### API Keys

Add your vendor API keys through the Settings page:

1. Navigate to Settings
2. Click "Add New API Key"
3. Select vendor and enter API key
4. Click "Add Key"

Supported vendors:

- SolarEdge (API Key)
- Enphase (OAuth 2.0)
- Generac (Session token)
- Tigo (API Token)
- CPS (Partner credentials)

### Polling Configuration

Adjust data refresh settings in Settings > Polling & Caching:

- **Polling Interval**: How often to fetch new data (5-60 minutes)
- **Caching Strategy**:
  - Aggressive: Faster, less API calls, may show stale data
  - Balanced: Good performance, reasonable real-time (default)
  - Real-time: Always fresh, more API calls

### Theme

Customize appearance:

- Light/Dark/System theme
- Accent color picker

## Development Tips

### Using Mock Data

For development without a backend, you can import mock data:

```typescript
import { mockSites, mockAlerts, mockDashboardStats } from "@/utils/mockData";
```

### Adding New Vendor

1. Update types in `src/types/index.ts`
2. Add vendor to `VENDORS` constant in `src/utils/constants.ts`
3. Add API integration in backend
4. Add to vendor dropdowns in UI

### State Management

The app uses XState for complex state management:

- `pollingMachine`: Manages automatic data refresh
- `dataFetchMachine`: Handles individual API calls

Use the `usePolling` hook for easy polling:

```typescript
import { usePolling } from "@/hooks/usePolling";

const { isPolling, isPaused, manualRefresh } = usePolling({
  onPoll: async () => {
    // Fetch data
  },
  intervalMs: 15 * 60 * 1000,
  maxPolls: 3,
});
```

## Building for Production

### Development Build

```bash
npm run build
```

### Create Installers

```bash
npm run electron:build
```

This creates platform-specific installers in `dist/`:

- macOS: `SunGazer-1.0.0.dmg`
- Windows: `SunGazer Setup 1.0.0.exe`

## Troubleshooting

### Backend Connection Issues

If you see "Network Error" or API call failures:

1. Verify backend is running: `http://localhost:8000/docs`
2. Check `VITE_API_BASE_URL` in `.env`
3. Ensure CORS is configured in backend

### Polling Not Working

If data doesn't refresh automatically:

1. Check browser console for errors
2. Verify polling is enabled in Settings
3. Check if user is marked as inactive (move mouse to reactivate)

### Missing Dependencies

If you see import errors:

```bash
npm install
npm run dev
```

### Electron Window Not Opening

```bash
# Kill any running Electron processes
pkill -f electron  # macOS/Linux
taskkill /F /IM electron.exe  # Windows

# Try again
npm run electron:dev
```

## Next Steps

1. Configure API keys in Settings
2. Verify backend connection
3. Explore Fleet Dashboard
4. Click on a site to view details
5. Check Alerts Center for any issues
6. Customize polling and appearance in Settings

## Resources

- [Technical Guide](docs/technical-guide.md)
- [Polling Strategy](docs/polling-handling.md)
- [State Management](<docs/state-machine-management-(XState).md>)
- [API Documentation](api-docs/)

## Support

For issues or questions, contact: support@sungazer.com
