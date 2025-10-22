☀️ SolarEdge Monitoring Server API — Technical Summary

Document: SolarEdge Monitoring Server API
Last Updated: August 2022
Source: SolarEdge Monitoring Platform Documentation

solar_edge_monitoring_api

1. Overview

The SolarEdge Monitoring Server API enables external applications to access and retrieve solar site performance data, device telemetry, and energy statistics from the SolarEdge Cloud Monitoring Platform.

✅ Key Highlights

RESTful architecture

Supports JSON, XML, and CSV response formats

Requires HTTPS and API key authentication

Supports site-level and account-level API keys

Includes rate limits and bulk query options

2. API Access & Authentication
   🔐 Access URL
   https://monitoringapi.solaredge.com

🔑 Authentication

Every request requires a valid API key as a URL parameter:

?api_key=<YOUR_API_KEY>

You can generate:

Account-level API keys: For accessing all sites under an account

Site-level API keys: For accessing individual sites

🔒 Security Guidelines

Never expose API keys publicly or store them in client-side code.

Rotate keys every 6 months.

Use HTTPS only.

Use Site API keys when integrating with third-party applications

solar_edge_monitoring_api

.

3. Request and Response Format
   Request

RESTful endpoints with predictable resource-oriented URLs

Standard HTTP methods (GET)

Parameter order not significant

Response

Supported content types:

application/json

application/xml

text/csv

Default: JSON

JSONP supported via callback parameter

Example

# JSON

https://monitoringapi.solaredge.com/site/1/details.json?api_key=YOUR_KEY

# JSONP

https://monitoringapi.solaredge.com/site/1/details.json?api_key=YOUR_KEY&callback=myFunction

4. Usage Limits
   Type Description Error Code
   Daily Limit 300 requests per account token and per site ID 429 (Too Many Requests)
   Concurrency Up to 3 concurrent calls per IP 429
   Bulk Calls Up to 100 site IDs per bulk request —

Exceeding limits may result in temporary access suspension.

5. Core API Endpoints
   🌍 Site Data APIs
   Endpoint Description
   /sites/list Returns a paginated list of sites under an account
   /site/{siteId}/details Retrieves details for a specific site
   /site/{siteId}/dataPeriod Returns start and end dates for site energy data
   /site/{siteId}/energy Returns energy data within a date range
   /site/{siteId}/power Returns 15-minute resolution power data
   /site/{siteId}/overview Summarizes power, daily/monthly/yearly/lifetime energy
   /site/{siteId}/powerDetails Detailed power by meter type (Production, Feed-in, Consumption)
   /site/{siteId}/energyDetails Detailed energy breakdown by meter
   /site/{siteId}/currentPowerFlow Real-time power flow across PV, grid, load, and storage
   /site/{siteId}/storageData Retrieves battery telemetry, charge/discharge, SoC, and health
   Example:
   GET /site/{siteId}/energy?startDate=2025-01-01&endDate=2025-01-31&timeUnit=DAY&api_key=YOUR_KEY

Response:

{
"energy": {
"timeUnit": "DAY",
"unit": "Wh",
"values": [
{ "date": "2025-01-01 00:00:00", "value": 67313.24 }
]
}
}

⚙️ Equipment & Meter APIs
Endpoint Description
/equipment/{siteId}/list Lists inverters with model, manufacturer, and serial number
/site/{siteId}/inventory Returns all equipment (inverters, batteries, meters, sensors)
/equipment/{siteId}/{serial}/data Retrieves inverter technical data (voltage, current, frequency, etc.)
/site/{siteId}/meters Returns meter data with lifetime energy and metadata
/equipment/{siteId}/{serial}/changeLog Lists equipment replacements with date and model
🧭 Account & Sensor APIs
Endpoint Description
/accounts/list Returns all accounts and subaccounts accessible with the API key
/equipment/{siteId}/sensors Lists sensors and associated gateways
/site/{siteId}/sensors Retrieves telemetry data from site sensors
💾 Version APIs
Endpoint Description
/version/current Returns current API version
/version/supported Returns all supported versions 6. Parameter Reference
Time Units

QUARTER_OF_AN_HOUR, HOUR, DAY, WEEK, MONTH, YEAR

Site Status

Active, Pending Communication

Site Types

Optimizers and Inverters, Safety and Monitoring Interface, Monitoring Combiner Boxes

7. Error Handling

Standard HTTP status codes:

200 OK – Successful response

403 Forbidden – Invalid key or permission issue

404 Not Found – Unknown resource

406 Not Acceptable – Unsupported media type

429 Too Many Requests – Rate or concurrency limit exceeded

8. Example Integration Workflow

Retrieve and Analyze Energy Data

Fetch all site IDs:

/sites/list?api_key=YOUR_KEY

Get energy metrics for each site:

/site/{id}/energy?startDate=2025-01-01&endDate=2025-01-31&timeUnit=DAY&api_key=YOUR_KEY

Fetch inverter data for diagnostics:

/equipment/{siteId}/{serial}/data?startTime=2025-01-05%2000:00:00&endTime=2025-01-05%2023:59:59

Aggregate and visualize daily production across all systems.

9. Best Practices

Use account-level keys only for internal dashboards; otherwise prefer site-level.

Implement client-side throttling to stay under rate limits.

Always store timestamps in UTC.

Verify response format (JSON/XML) explicitly via query or headers.

Cache results locally when querying large datasets.
