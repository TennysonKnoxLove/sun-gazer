# 🌞 SunGazer

A unified solar monitoring platform for aggregating data from multiple vendor APIs into a single, intuitive desktop application.

## Overview

SunGazer is an Electron-based desktop application built for Solar Power & Light (SP&L) to monitor and manage solar installations across multiple vendors including SolarEdge, Enphase, Generac, Tigo, and CPS (Chint Power Systems).

## Features

- **Unified Fleet Dashboard**: View all solar sites in one place with real-time status and metrics
- **Alerts Center**: Centralized alert management across all vendors
- **Site Details**: Deep dive into individual site performance with multiple tabs:
  - Overview with KPIs and health scores
  - Device inventory and status
  - Alert history
  - Energy production charts
  - Panel schematic visualization
  - Timeline and notes
- **Settings Management**: Configure API keys, polling intervals, and application preferences
- **Smart Polling**: Intelligent data refresh with configurable intervals and automatic pause on inactivity
- **Offline Support**: Local SQLite caching for historical data access

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Ant Design** (AntD) for UI components
- **XState** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Electron** for desktop wrapper

### Backend (Separate Repository)
- **Python** with FastAPI
- **SQLite** with SQLAlchemy ORM
- **APScheduler** for background polling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ (for backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Sun-Gazer
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure the backend API URL in `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

### Development

Run the application in development mode:

```bash
# Start the Vite dev server and Electron
npm run electron:dev
```

Or run them separately:

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron (after Vite is running)
electron .
```

### Building

Build the application for production:

```bash
npm run build
npm run electron:build
```

This will create distributable packages in the `dist/` directory.

## Project Structure

```
Sun-Gazer/
├── electron/              # Electron main process
│   └── main.js
├── src/
│   ├── components/        # Reusable React components
│   │   └── layout/        # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── machines/          # XState state machines
│   ├── pages/             # Main application pages
│   │   ├── FleetDashboard.tsx
│   │   ├── AlertsCenter.tsx
│   │   ├── Settings.tsx
│   │   └── SiteDetails.tsx
│   ├── services/          # API service layer
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and constants
│   ├── App.tsx            # Root application component
│   └── main.tsx           # Application entry point
├── docs/                  # Documentation
├── api-docs/              # Vendor API documentation
└── visily-mockups/        # UI mockups
```

## Architecture

### State Management

The application uses **XState** for managing complex asynchronous data flows:

- **Polling Machine**: Manages automatic data refresh with configurable intervals
- **Data Fetch Machine**: Handles individual resource fetching with error handling

### Polling Strategy

Based on the configuration in `docs/polling-handling.md`:

- **Dashboard TTL**: 45 minutes
- **Site TTL**: 15 minutes  
- **Poll Interval**: 15 minutes (configurable)
- **Max Repolls**: 3 per view activation
- **Inactivity Timeout**: 5 minutes
- Automatic pause and resume based on user activity

### API Integration

The frontend communicates with the Python backend via REST API:

- Dashboard stats and aggregates
- Site details and metrics
- Device inventory
- Alert management
- Settings and configuration

## Vendor Support

| Vendor | Status | Authentication | Notes |
|--------|--------|---------------|-------|
| **Enphase** | ✅ Official API | OAuth 2.0 | Well-documented, reliable |
| **SolarEdge** | ✅ Official API | API Key | Rate limited (300 req/day) |
| **Generac** | ⚠️ Unsupported | Session scraping | Fragile, best-effort |
| **Tigo** | ✅ Premium API | Token | Requires subscription |
| **CPS (Chint)** | 🔒 Partner-gated | TBD | Requires onboarding |

## Configuration

Configure the application via the Settings page:

- **API Keys**: Add and manage vendor API credentials
- **Polling Interval**: Adjust data refresh frequency (5-60 minutes)
- **Caching Strategy**: Choose between aggressive, balanced, or real-time
- **Theme**: Select light, dark, or system theme
- **Backup/Export**: Export configuration and data

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Ant Design components for UI consistency
- Implement proper error handling and loading states

### Adding New Features

1. Update types in `src/types/index.ts`
2. Add API endpoints in `src/services/api.ts`
3. Create or update page components in `src/pages/`
4. Update routing in `src/App.tsx`

### Testing

The application is designed to work with mock data during development. The backend should provide appropriate mock responses for testing without real API credentials.

## Deployment

The application can be packaged for both macOS and Windows:

```bash
npm run electron:build
```

Installers will be created in the `dist/` directory:
- macOS: `.dmg` file
- Windows: `.exe` installer (NSIS)

## Documentation

Additional documentation is available in the `docs/` directory:

- `technical-guide.md`: Technical architecture and data models
- `sun-gazer-proposal.md`: Project overview and scope
- `polling-handling.md`: Detailed polling strategy
- `state-machine-management-(XState).md`: XState implementation guide
- `component-libraries.md`: UI component recommendations

## Support

For issues or questions:
- Email: support@sungazer.com
- Documentation: [View Online Docs](#)

## License

Proprietary - Solar Power & Light (SP&L)

---

**Made with Visily** | Version 1.2.0

