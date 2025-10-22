🌞 Sungaze: Technical Design & Developer Guide

Project: Sungaze Platform
Audience: Lead Developer
Version: 1.0 (September 16, 2025)
Prepared By: Tennyson Love

📘 Purpose

This document serves as the primary technical source of truth for building the Sungaze application.
It details the system architecture, data models, and vendor-specific integration strategies.

1. Project Objective (Developer's View)

The goal is to build a cross-platform desktop application that aggregates solar monitoring data from five vendors:

Enphase, SolarEdge, Generac, Tigo, and CPS (Chint Power Systems)

Architecture Overview

Backend: Python

Frontend: React / Electron

Database: SQLite (for caching and persistence)

2. Core Architecture & Data Flow
   Frontend

Built with React + TypeScript

Interacts only with the Python backend via API calls

Backend

Built with FastAPI

Uses:

SQLAlchemy ORM for database management

APScheduler for background polling

Vendor Connectors for API communication

Normalization Layer for data consistency

Database

SQLite for local caching, persistence, and offline history

Optimized for fast queries and lightweight storage

3. Canonical Data Model (Schema)
   Table Key Fields Description
   Site id, vendor, vendor_site_id, name, status, peak_power_kw, address_info, last_updated Represents a monitored solar site
   Device id, site_id, vendor, vendor_device_id, device_type, model, manufacturer, status Represents an inverter, microinverter, or panel device
   TimeseriesMetric id, site_id, device_id, timestamp(UTC), metric_name, value Stores power, voltage, and performance metrics
   Alert id, site_id, device_id, timestamp, severity, code, description, status Unified alert tracking
4. Vendor Integration Playbook
   A. Enphase (Priority 1)

Authentication: OAuth 2.0

Endpoints: /systems, /inventory, /summary, /power_production

Notes: Official API; reliable and well-documented

B. SolarEdge (Priority 2)

Authentication: API Key

Rate Limits: 300 requests/day per site/account, 3 concurrent calls

Branding Requirements: Must display SolarEdge logo + link

Endpoints: /sites/list, /overview, /energy, /power, /inventory

C. Generac (Priority 3)

Authentication: Scraped session (unsupported API)

Polling Interval: ~30 minutes

Endpoints: site.json, power/now, energy/now

Notes: Fragile integration; mark data as stale when scraping fails

D. Tigo Energy (Priority 4)

Authentication: Token-based (Premium subscription required)

Endpoints: /users/login, /systems, /data/summary, /data/aggregate, /alerts/system

Notes: Enforce strict rate limits

E. Chint Power Systems (CPS) (Priority 5)

Access: Partner-gated, requires CPS America onboarding

Protocols: MQTT, Modbus/TCP, HTTPS (via FlexOM gateway)

Open API: Supports both MQTT and HTTPS push models

Implementation Strategy

Treat CPS integration as a business dependency

Once API access is granted:

Determine if REST or MQTT will be used

For MQTT: use paho-mqtt client to subscribe and handle data

For REST: follow polling model like other vendors

Until onboarding is complete, CPS integration remains blocked

5. Feature Implementation Plan: Schematic Panel Layout
   Layer Function
   Backend Fetch device list, filter active devices, sort deterministically by serial_number, and serve via GET /api/sites/{id}/layout.
   Frontend Retrieve layout, compute grid (CSS Grid / Flexbox), map devices to cells, display serial and metric, and include a disclaimer.
6. Development Best Practices

Secrets Management: Use .env files and python-dotenv; never commit secrets.

Timezones: Store all timestamps in UTC; convert in UI.

Error Handling: Use robust try/except; fallback to cached data.

Code Organization: Maintain a connectors/ directory with one file per vendor.
