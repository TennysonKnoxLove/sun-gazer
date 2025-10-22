Enphase API v4 — Data Retrieval Reference

Last updated: 2025-10-08

This reference covers read-only endpoints to fetch system, telemetry, and configuration data from the Enphase Enlighten platform.
All calls use standard HTTPS with API key authentication.

Base URL:

https://api.enphaseenergy.com/api/v4

⚙️ Common Response Codes
Code Meaning Notes
200 OK Successful request
401 Unauthorized Missing/invalid API key
404 Not Found Resource unavailable
405 Method Not Allowed Wrong HTTP verb
422 Unprocessable Entity Invalid parameters
429 Too Many Requests Rate-limit exceeded
501 Not Implemented Endpoint unsupported for your plan
🌐 Systems
GET /systems/config/{system_id}/grid_status

Retrieve grid connectivity state.

{ "system_id": 1765, "grid_state": "On Grid", "last_report_date": 1676029267 }

GET /systems/config/{system_id}/load_control

Fetch load control configuration for connected devices.

{
"system_id": 1932237,
"load_control_data": [
{ "name":"NC1", "load_name":"Downstairs A/C", "mode":"Basic", "status":"enabled" }
]
}

GET /systems/config/{system_id}/storm_guard

Retrieve current Storm Guard status.

{ "system_id":1765, "storm_guard_status":"Enabled (Inactive)", "storm_alert":"false" }

⚡ EV Chargers
GET /systems/{system_id}/ev_charger/devices

List active EV chargers for a system.

{
"system_id":698989834,
"devices": {
"ev_chargers":[
{
"serial_number":"202320010308",
"status":"normal",
"model":"IQ-EVSE-40R",
"firmware":"v0.04.22"
}
]
}
}

GET /systems/{system_id}/ev_charger/events

Retrieve charger events (start, stop, errors, etc.).

{ "count":1, "events":[{ "status":"Info", "details":"Charging started." }] }

GET /systems/{system_id}/ev_charger/{serial_no}/sessions

List charge sessions with time, energy, and cost data.

{
"count":1,
"sessions":[
{ "start_time":1700059683, "duration":11497, "energy_added":14.83, "cost":0.5 }
]
}

GET /systems/{system_id}/ev_charger/{serial_no}/lifetime

Aggregate lifetime/daily energy usage.

{ "system_id":698989834, "start_date":"2024-01-01", "consumption":[3494,21929,0] }

GET /systems/{system_id}/ev_charger/{serial_no}/telemetry

Fetch high-resolution charger telemetry.
Query parameters:

granularity=day|week

start_date=YYYYMMDD or start_at=epoch

{
"granularity":"day",
"consumption":[{ "consumption":202, "end_at":1705406400 }]
}

🔋 Activations (Systems)
GET /partner/activations

List all accessible systems.

{ "count": 2, "activations":[{ "id":123, "system_name":"Main PV Array" }] }

GET /partner/activations/{activation_id}

Retrieve detailed activation metadata.

{
"id":123,
"system_name":"Main PV Array",
"stage":3,
"grid_mode":"On Grid",
"address":"123 Solar Way, CA"
}

GET /activations/{activation_id}/battery_mode

Check battery charge/discharge mode.

{ "CFG_allowed": true, "DTG_allowed": false }

GET /activations/{activation_id}/ops/production_mode

View system production mode.

{ "mode":"on","total_micros":21,"energy_producing_micros":18 }

GET /activations/{activation_id}/estimate

Retrieve system production estimates.

{
"system_id":67,
"degrade_factor":"0.4",
"month_estimates":["3112","3248","3805"]
}

🏢 Companies & Users (Read-Only)
GET /companies/{company_id}/users

List users in a company.

{ "users":[ [6,"test@gmail.com"], [7,"test2@gmail.com"] ] }

GET /companies/self/branches

Get current user’s company and branches.

{
"company_id":9,
"company_name":"Super Solar",
"branches":[{ "company_id":81, "company_name":"Super Solar North" }]
}

GET /companies/self/authorized_subcontractors

Get authorized subcontractors for a company.

{
"company_id":9,
"authorized_subcontractors":[
{ "company_id":81, "company_name":"Super Solar North", "status":"Enabled" }
]
}

GET /partner/users/self

Fetch current authenticated user profile.

{
"user_id":123456,
"email":"user@example.com",
"company":{"company_name":"Enphase Energy","roles":["installer"]}
}

🌞 PV Modules & Meters
GET /systems/{system_id}/meters/{serial_number}

Retrieve a meter by serial.

{
"serial_number":"123456789012",
"type":"production",
"status":"normal",
"state":"enabled"
}

GET /pv_manufacturers

List known PV module manufacturers.

{ "pv_manufacturers":[ [106,"1Soltech"], [107,"AIDE Solar"] ] }

GET /pv_manufacturers/{pv_manufacturer_id}/pv_models

List module models for a manufacturer.

{
"pv_manufacturer":{"name":"Alps Technology Inc"},
"pv_models":[ [1047,"ATI 1650-155"], [1048,"ATI 1650-165"] ]
}

💰 Tariffs
GET /systems/config/{system_id}/tariff

Fetch system tariff and storage settings.

{
"tariff": {
"currency": { "code": "AUD" },
"single_rate": { "rate": "1", "sell": "1" },
"storage_settings": { "mode": "backup", "reserved_soc": 100 }
}
}

🧩 Arrays
GET /partner/systems/{system_id}/arrays

Retrieve array layout and module mapping.

{
"system_id":698927061,
"arrays":[{ "label":"First","tilt":"30.0","modules":[{"serial_num":"121501065212"}] }]
}

GET /partner/systems/{system_id}/arrays/{array_id}

Retrieve single array details.

{
"id":207359,
"label":"First",
"modules":[{"serial_num":"121501065212"}]
}

🔄 Status Mapping
API Status Enlighten UI Label
normal System Normal
comm Envoy Not Reporting
micro Microinverters Not Reporting
power System Production Issue
meter_issue Meter Issue
storage_idle Storage Inactive
warning Warning
error Error
no_data No Data
on_grid / off_grid Grid Status
unknown Updating Data
