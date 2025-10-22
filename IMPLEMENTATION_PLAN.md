# Sun Gazer Implementation Plan

## Overview

Sun Gazer is a desktop application that aggregates solar monitoring data from multiple vendors (Enphase, SolarEdge, Generac, Tigo, and CPS) into a unified dashboard. The application is built using Electron, React, and Python, focusing on real-time monitoring and alerting.

## Tech Stack

### Frontend

- React + TypeScript
- Electron for desktop wrapper
- Ant Design (AntD) for UI components
- XState for state management

### Backend

- Python with FastAPI
- SQLite + SQLAlchemy ORM
- APScheduler for polling

## Core Features

1. **Fleet Dashboard**: Overview of all solar sites
2. **Site Details**: Detailed metrics and status for individual sites
3. **Alerts Center**: Unified view of all active alerts
4. **Settings**: API key management and app configuration

## Implementation Phases

### Phase 1: Project Setup & Foundation (1 week)

- [ ] Setup development environment (Python + Node.js + Electron)
- [ ] Initialize project structure with React + TypeScript + Electron
- [ ] Setup FastAPI backend with SQLAlchemy + SQLite
- [ ] Implement basic IPC (Inter-Process Communication) between Electron and backend

### Phase 2: Core UI Implementation (2 weeks)

- [ ] Implement settings page for API key management
- [ ] Create Fleet Dashboard layout based on mockup
- [ ] Implement Site Details view based on mockup
- [ ] Create Alerts Center based on mockup
- [ ] Setup XState for managing API states and data polling

### Phase 3: Core Backend & First Vendor (2 weeks)

- [ ] Implement database schema (minimal: Sites, Devices, Current Metrics, Active Alerts)
- [ ] Setup polling system with APScheduler
- [ ] Implement Enphase integration with API key auth
- [ ] Create data normalization layer for metrics and alerts

### Phase 4: Additional Vendor Integrations (3 weeks)

- [ ] Implement SolarEdge integration with rate limiting
- [ ] Create Generac scraping module with error handling
- [ ] Add Tigo integration
- [ ] Prepare CPS integration structure

### Phase 5: Polish & Deployment (1 week)

- [ ] Implement optional auto-update system with popup notifications
- [ ] Create installers for Windows and macOS
- [ ] Add error boundaries and fallback states for API failures
- [ ] Write basic documentation for installation and API key setup

## Project Structure

```
sun-gazer/
├── electron/              # Electron main process
│   ├── main.ts
│   └── ipc.ts
├── src/                   # React frontend
│   ├── components/
│   ├── machines/         # XState definitions
│   ├── pages/
│   └── App.tsx
├── backend/              # Python backend
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   └── services/
│   ├── connectors/      # Vendor API integrations
│   └── main.py
└── package.json
```

## Data Models

### Minimal Database Schema

```sql
-- Only tracking current state and active alerts
CREATE TABLE sites (
    id TEXT PRIMARY KEY,
    vendor TEXT NOT NULL,
    vendor_site_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    last_updated TIMESTAMP NOT NULL
);

CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    vendor TEXT NOT NULL,
    vendor_device_id TEXT NOT NULL,
    device_type TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id)
);

CREATE TABLE current_metrics (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE active_alerts (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    device_id TEXT,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);
```

## Polling Configuration

- Default interval: 15 minutes
- Configurable per vendor
- Rate limiting:
  - SolarEdge: 300 requests/day per site
  - Other vendors: As per API documentation

## UI Pages (Based on Visily Mockups)

1. **Fleet Dashboard** (`/`)

   - Grid of site cards
   - Key metrics
   - Status indicators

2. **Site Details** (`/sites/:id`)

   - Detailed metrics
   - Device status
   - Recent alerts

3. **Alerts Center** (`/alerts`)

   - All active alerts
   - Filter by severity
   - Group by site

4. **Settings** (`/settings`)
   - API key management
   - Polling configuration
   - App preferences

## Update System

- Optional updates
- Popup notification when new version available
- User can choose when to install
- Separate download and install steps

## Timeline

Total estimated time: 9 weeks

- Phase 1: 1 week
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Phase 4: 3 weeks
- Phase 5: 1 week
