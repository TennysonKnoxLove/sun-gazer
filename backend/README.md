# SunGazer Backend

Python FastAPI backend for the SunGazer solar monitoring platform.

## Features

- ✅ FastAPI web framework with automatic API documentation
- ✅ SQLite database with SQLAlchemy ORM
- ✅ SolarEdge API connector with rate limiting
- ✅ Enphase API connector with OAuth support
- ✅ Background scheduling with APScheduler
- ✅ Data normalization layer
- ✅ RESTful API endpoints for dashboard, sites, alerts, and settings

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
SOLAREDGE_API_KEY=your_solaredge_key_here
ENPHASE_API_KEY=your_enphase_token_here
```

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── dashboard.py
│   │   ├── sites.py
│   │   ├── alerts.py
│   │   └── settings.py
│   ├── connectors/       # Vendor API connectors
│   │   ├── base.py
│   │   ├── solaredge.py
│   │   └── enphase.py
│   ├── core/             # Core configuration
│   │   ├── config.py
│   │   ├── database.py
│   │   └── scheduler.py
│   ├── models/           # Database models
│   │   ├── site.py
│   │   ├── device.py
│   │   ├── alert.py
│   │   ├── timeseries.py
│   │   ├── api_key.py
│   │   └── fetch_log.py
│   └── services/         # Business logic
│       └── data_service.py
├── main.py               # Application entry point
├── requirements.txt      # Python dependencies
└── .env                  # Environment configuration
```

## Available Vendors

### ✅ SolarEdge (Implemented)
- Official API with rate limiting (300 requests/day)
- Endpoints: sites, overview, energy, devices, power

### ✅ Enphase (Implemented)
- OAuth 2.0 authentication
- Endpoints: systems, production, devices

### 🚧 Coming Soon
- **Generac**: Session-based scraping
- **Tigo**: Premium API subscription required
- **CPS**: Partner onboarding required

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `POST /api/dashboard/refresh` - Trigger dashboard refresh

### Sites
- `GET /api/sites` - Get all sites
- `GET /api/sites/{site_id}` - Get site details
- `GET /api/sites/{site_id}/overview` - Get site overview
- `GET /api/sites/{site_id}/energy?period=day` - Get energy data
- `GET /api/sites/{site_id}/devices` - Get devices
- `GET /api/sites/{site_id}/layout` - Get panel layout
- `POST /api/sites/{site_id}/refresh` - Refresh site data

### Alerts
- `GET /api/alerts` - Get all alerts (with filtering)
- `GET /api/alerts/{site_id}/alerts` - Get site alerts
- `PATCH /api/alerts/{alert_id}/acknowledge` - Acknowledge alert
- `PATCH /api/alerts/{alert_id}/resolve` - Resolve alert

### Settings
- `GET /api/settings` - Get application settings
- `PATCH /api/settings` - Update settings
- `GET /api/settings/api-keys` - Get API keys
- `POST /api/settings/api-keys` - Add API key
- `DELETE /api/settings/api-keys/{key_id}` - Delete API key
- `POST /api/settings/clear-cache` - Clear cache
- `GET /api/settings/export` - Export data
- `POST /api/settings/import` - Import data

## Database Models

- **Site**: Solar installation sites
- **Device**: Equipment (inverters, panels, meters, batteries)
- **Alert**: System alerts and notifications
- **TimeseriesMetric**: Power/energy timeseries data
- **ApiKey**: Vendor API credentials
- **FetchLog**: API call history and status

## Background Jobs

The scheduler runs periodic jobs:

- **Poll Sites**: Every 15 minutes (configurable)
  - Fetches latest data from all vendors
  - Updates database
  - Logs fetch status

## Development

### Adding a New Vendor

1. Create connector in `app/connectors/new_vendor.py`
2. Implement `BaseConnector` methods
3. Add to `data_service.py`
4. Update frontend vendor config

### Testing API

Use the interactive Swagger UI at `/docs` or:

```bash
# Get sites
curl http://localhost:8000/api/sites

# Get dashboard stats
curl http://localhost:8000/api/dashboard/stats
```

## Troubleshooting

### Database Issues
```bash
# Delete database and start fresh
rm sungazer.db
python main.py
```

### API Rate Limits
- SolarEdge: 300 requests/day per site
- Monitor rate limits in `/api/settings/api-keys`

### CORS Issues
- Update `CORS_ORIGINS` in `.env`
- Default allows `localhost:5173` and `localhost:3000`

## Production Deployment

1. Set environment variables securely
2. Use a production WSGI server (Gunicorn)
3. Enable HTTPS
4. Set up proper logging
5. Configure database backups
6. Implement API key encryption

```bash
# Production server with Gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## License

Proprietary - Solar Power & Light (SP&L)

