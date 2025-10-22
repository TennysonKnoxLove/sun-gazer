🌞 Sun Gazer Platform — Project Proposal & Scope of Work

Company: Solar Power & Light (SP&L)
Prepared For: SP&L Operations Team
Prepared By: Tennyson Love
Date: September 16, 2025
Version: 1.0

1. Executive Summary

Solar Power & Light (SP&L) technicians and operations staff currently face inefficiencies due to fragmented monitoring platforms. Each solar brand (Generac, SolarEdge, Enphase, Chint, etc.) requires separate logins, making it difficult to view fleet-wide health and production.

The Sun Gazer Platform will unify vendor APIs into a single desktop application with a centralized dashboard. This will streamline workflows, reduce manual effort, and empower SP&L with actionable insights across all sites.

2. The Problem

SP&L staff must switch between four or more vendor apps to track system status.
This workflow is inefficient, fragmented, and reactive. As SP&L grows, the issue will only compound—
increasing operational overhead and delaying issue detection.

3. Proposed Solution: The Sun Gazer Platform

Sun Gazer is a custom desktop application aggregating data from multiple vendor APIs into one intuitive interface.
It will fetch and normalize data on a schedule, store it locally, and display it via a React/Electron frontend.

Result:

A unified, fast, and actionable view of SP&L’s entire solar fleet.

Key Features

Unified Fleet Dashboard: All sites in one view with status and key metrics.

Detailed Site View: Drill into production, inverter/microinverter status, and history.

Normalized Alerts: Unified error and alert display across vendors.

Schematic Panel Layout: Grid-based visualization of panels for quick reference.

4. Technical Architecture & Stack
   Component Technology
   Application Type Desktop (macOS & Windows)
   Desktop Wrapper Electron JS
   Frontend React & TypeScript
   Backend Python (data polling, API logic)
   Database SQLite + SQLAlchemy ORM
5. Vendor API Integration Summary
   Vendor API Status Authentication Constraints
   Enphase Official OAuth 2.0 Well-documented, reliable
   SolarEdge Official API Key Strict rate limits, branding required
   Generac Unsupported Scraped Session Fragile, best-effort, delayed
   Tigo Premium API Key Requires paid subscription
   Chint Power Systems (CPS) Partner-Gated TBD Requires CPS onboarding to access Open API
6. Phased Development Plan & Milestones
   Phase Description Duration
7. Foundation & Discovery Setup environment, DB schema, and vendor outreach. 1 Week
8. Core Engine & First Integration Build backend engine, Enphase integration, basic UI. 3–4 Weeks
9. Vendor Expansion Add SolarEdge, Generac, Tigo, CPS integrations. Implement normalization layer. 4–5 Weeks
10. Advanced Features & Polish Panel schematic, filtering, styling, charts. 2–3 Weeks
11. Deployment & Handoff Package installers, deploy to office PCs, documentation. 1 Week
12. Risks & Mitigation Strategies
    Risk Mitigation
    Generac Scraping Breaks Best-effort, handled with robust error fallback.
    SolarEdge Rate Limits Centralized throttling & quota management.
    Delayed CPS/Tigo Access Parallelize development to avoid blockers.
    Inconsistent Vendor Data Canonical data model & normalization layer.
    Panel Layout Accuracy Labeled as schematic only, disclaimer in UI.
13. Scope Definition
    In Scope:

Windows/macOS desktop app.

Read-only aggregation from Enphase, SolarEdge, Generac, Tigo, CPS.

Fleet overview, site detail, alerts dashboard, schematic panel layout.

Local caching for historical data.
