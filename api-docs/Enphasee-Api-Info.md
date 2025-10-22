Documentation
Note: Both Monitoring and Commissioning API follow OAuth 2.0 authentication. Each API request should include an OAuth 2.0 access token as Authorization header using the Bearer scheme, and the request should also include the API key of your application in header with name 'key'.

System Details

GET
/api/v4/systems
Fetch systems

Returns a list of systems for which the user can make API requests. By default, systems are returned in batches of 10. The maximum size is 100.

Parameters
Name Description
page
integer
(query)
The page to be returned. Default=1, Min=1. For example, if page is set to 2, 2nd page is returned

page
size
integer
(query)
Maximum number of records shown per page. Default=10, Min=1, Max=100. For example, if max is set to 5, 5 records are shown per page

size
sort_by
string
(query)
Returns list of systems sorted by <sort_by> field. To get the ASC order sorted list, user sort_by = id. To get the DESC order sorted list, use sort_by = -id. By default, the list is sorted by ascending order of system ID.

Available values : id, -id

--
Responses
Response content type

application/json
Code Description
200
List of Systems

Example Value
Model
{
"total": 28,
"current_page": 1,
"size": 2,
"count": 2,
"items": "systems",
"systems": [
{
"system_id": 698910067,
"name": "Enphase System",
"public_name": "Residential System",
"timezone": "Australia/Sydney",
"address": {
"city": "Sydney",
"state": "NSW",
"country": "AU",
"postal_code": "2127"
},
"connection_type": "ethernet",
"energy_lifetime": -1,
"energy_today": -1,
"system_size": -1,
"status": "micro",
"last_report_at": 1508174262,
"last_energy_at": 1508174172,
"operational_at": 1497445200,
"attachment_type": null,
"interconnect_date": null,
"reference": "106015287",
"other_references": [
"106015287"
]
},
{
"system_id": 698906018,
"name": "Enphase Public System",
"public_name": "Residential System",
"timezone": "US/Pacific",
"address": {
"city": "Los Angeles",
"state": "CA",
"country": "US",
"postal_code": "94954"
},
"connection_type": "ethernet",
"energy_lifetime": -1,
"energy_today": -1,
"system_size": -1,
"status": "normal",
"last_report_at": 1508174262,
"last_energy_at": 1508174172,
"operational_at": 1497445200,
"attachment_type": null,
"interconnect_date": null
}
]
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
422
Unprocessable Entity

Example Value
Model
{
"message": "Unprocessable Entity",
"details": "Invalid request because of 'The sorting parameter is not supported. Please use id for sorting by Asc or -id for sorting by Desc'",
"code": 422
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

POST
/api/v4/systems/search
Search and filter systems

Search and filter systems. Provide only valid values in request parameters. Empty values will be ignored. Invalid keys will be rejected.

Parameters
Name Description
page
integer
(query)
The page to be returned. Default=1, Min=1, e.g=2

page
size
integer
(query)
Maximum number of records shown per page. Default=10, Min=1, Max=1000, e.g=5

size
params
object
(body)
Example Value
Model
{
"sort_by": "id",
"system": {
"ids": [
0
],
"name": "string",
"reference": "string",
"other_reference": "string",
"statuses": [
"normal"
]
}
}
Parameter content type

application/json
Responses
Response content type

application/json
Code Description
200
List of Systems

Example Value
Model
{
"total": 28,
"current_page": 1,
"size": 2,
"count": 2,
"items": "systems",
"systems": [
{
"system_id": 698910067,
"name": "Enphase System",
"public_name": "Residential System",
"timezone": null,
"address": {
"state": null,
"country": null,
"postal_code": null
},
"connection_type": "ethernet",
"status": "micro",
"last_report_at": 1557400231,
"last_energy_at": null,
"operational_at": null,
"attachment_type": null,
"interconnect_date": null,
"energy_lifetime": -1,
"energy_today": -1,
"system_size": -1
},
{
"system_id": 698906018,
"name": "Enphase Public System",
"public_name": "Residential System",
"timezone": "US/Pacific",
"address": {
"state": "CA",
"country": "US",
"postal_code": "94954"
},
"connection_type": "ethernet",
"status": "normal",
"last_report_at": 1508174262,
"last_energy_at": 1508174172,
"operational_at": 1497445200,
"attachment_type": null,
"interconnect_date": null,
"energy_lifetime": -1,
"energy_today": -1,
"system_size": -1,
"reference": "106015287",
"other_references": [
"106015287"
]
}
]
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
422
Unprocessable Entity

Example Value
Model
{
"message": "Unprocessable Entity",
"details": "system is missing at Json body location",
"code": 422
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/{system_id}
Retrieves a System by id

Retrieves a System by ID

Parameters
Name Description
system_id \*
integer
(path)
The unique numeric ID of the system. If an empty value is passed in the ID, this endpoint behaves as Fetch systems endpoint.

system_id
Responses
Response content type

application/json
Code Description
200
System fetched

Example Value
Model
{
"system_id": 72,
"name": "Enphase System",
"public_name": "Residential System",
"timezone": "America/Los_Angeles",
"address": {
"city": "Los Angeles",
"state": "CA",
"country": "US",
"postal_code": "94954"
},
"connection_type": "cellular",
"energy_lifetime": -1,
"energy_today": -1,
"system_size": -1,
"status": "normal",
"last_report_at": 1445619615,
"last_energy_at": 1445619033,
"operational_at": 1357023600,
"attachment_type": "acm",
"interconnect_date": "2012-10-13",
"reference": "106015287",
"other_references": [
"106015287"
]
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
403
Forbidden

Example Value
Model
{
"message": "Forbidden",
"details": "Not authorized to access this resource",
"code": 403
}
404
Not Found

Example Value
Model
{
"message": "Not Found",
"details": "System not found for {:id=>\"1\"}",
"code": 404
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/{system_id}/summary
Retrieves a system summary

Returns system summary based on the specified system ID.

Parameters
Name Description
system_id \*
integer
(path)
The unique numeric ID of the system

system_id
Responses
Response content type

application/json
Code Description
200
System summary fetched

Example Value
Model
{
"system_id": 698910067,
"current_power": 0,
"energy_lifetime": 0,
"energy_today": 0,
"last_interval_end_at": 1557400231,
"last_report_at": 1557400231,
"modules": 5,
"operational_at": null,
"size_w": 1250,
"nmi": "1213141516",
"source": "meter",
"status": "normal",
"summary_date": "2019-05-12",
"battery_charge_w": 1280,
"battery_discharge_w": 1280,
"battery_capacity_wh": 3360
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
403
Forbidden

Example Value
Model
{
"message": "Forbidden",
"details": "Not authorized to access this resource",
"code": 403
}
404
Not Found

Example Value
Model
{
"message": "Not Found",
"details": "System not found for {:id=>\"1\"}",
"code": 404
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429,
"period": "minute",
"period_start": 1623825660,
"period_end": 1623825720,
"limit": 5
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/{system_id}/devices
Retrieves devices for a given system

Retrieves devices for a given system. Only devices that are active will be returned in the response.

Parameters
Name Description
system_id \*
integer
(path)
The unique numeric ID of the system

system_id
Responses
Response content type

application/json
Code Description
200
List of devices

Example Value
Model
{
"system_id": 698910067,
"total_devices": 11,
"items": "devices",
"devices": {
"micros": [
{
"id": 1023273222,
"last_report_at": 1508174262,
"name": "Microinverter 902167438951",
"serial_number": "902167438951",
"part_number": "800-01333-r01",
"sku": "IQ8A-72-2-US",
"model": "M250",
"status": "normal",
"active": true,
"product_name": "M250"
},
{
"id": 1023273243,
"last_report_at": 1508174262,
"name": "Microinverter 902372021616",
"serial_number": "902372021616",
"part_number": "800-01333-r01",
"sku": "IQ8A-72-2-US",
"model": "M250",
"status": "normal",
"active": true,
"product_name": "M250"
}
],
"meters": [
{
"id": 1059640322,
"last_report_at": 1508174262,
"name": "production",
"serial_number": "901553005272EIM1",
"part_number": "800-00655-r08",
"sku": null,
"model": "Envoy S",
"status": "normal",
"active": true,
"state": "enabled",
"config_type": "Net",
"product_name": "RGM"
},
{
"id": 1059640322,
"last_report_at": 1508174262,
"name": "production",
"serial_number": "901553005272EIM2",
"part_number": "800-00655-r08",
"sku": null,
"model": "Envoy S",
"status": "normal",
"active": true,
"state": "enabled",
"config_type": "Production",
"product_name": "RGM"
}
],
"gateways": [
{
"id": 1059563029,
"last_report_at": 1508174262,
"name": "Gateway 202323054201",
"serial_number": "901553005272",
"part_number": "800-00655-r08",
"emu_sw_version": "D4.6.11.170403 (799d2d)",
"sku": "ENV-IQ-AM1-240",
"model": "Envoy-S-Standard-NA",
"status": "normal",
"active": true,
"cellular_modem": {
"imei": "352009112238477",
"part_num": "860-00157-r01",
"sku": "CELLMODEM-M1",
"plan_start_date": 1614796200,
"plan_end_date": 1772562600
},
"product_name": "Envoy-S-Metered-EU"
}
],
"q_relays": [
{
"id": 1059640316,
"last_report_at": 1508174262,
"name": "IQ Relay 912158973973",
"serial_number": "912158973973",
"part_number": "800-00595-r01",
"sku": "Q-RELAY-1P-INT",
"model": "",
"status": "normal",
"active": true,
"product_name": "IQ Relay"
},
{
"id": 1059640326,
"last_report_at": 1508174262,
"name": "IQ Relay 912163603334",
"serial_number": "912163603334",
"part_number": "800-00595-r01",
"sku": "Q-RELAY-1P-INT",
"model": "",
"status": "normal",
"active": true,
"product_name": "IQ Relay"
}
],
"acbs": [
{
"id": 1059640321,
"last_report_at": 1508174262,
"name": "AC Battery 911364446952",
"serial_number": "911364446952",
"part_number": "800-00560-r03",
"sku": "IQ7-B1200-LN-I-INT01-RV0",
"model": "",
"status": "normal",
"active": true,
"product_name": "ACB"
},
{
"id": 1059640321,
"last_report_at": 1508174262,
"name": "AC Battery 911499228280",
"serial_number": "911499228280",
"part_number": "800-00560-r03",
"sku": "IQ7-B1200-LN-I-INT01-RV0",
"model": "",
"status": "normal",
"active": true,
"product_name": "ACB"
}
],
"encharges": [
{
"id": 1059640295,
"last_report_at": 1508174262,
"name": "IQ Battery 492312001241",
"serial_number": "121593621979",
"part_number": "800-00562-r01",
"sku": "B03-A01-US00-1-3",
"model": "",
"status": "normal",
"active": true,
"product_name": "IQ Battery R3 - 5P"
}
],
"enpowers": [
{
"id": 1059640294,
"last_report_at": 1508174262,
"name": "IQ System Controller 482218007023",
"serial_number": "121245173988",
"part_number": "800-01135-r02",
"sku": "EP200G101-M240US00",
"model": "",
"status": "normal",
"active": true,
"product_name": "IQ System Controller"
}
],
"ev_chargers": [
{
"id": 202313029329,
"last_report_at": 1686134789,
"name": "IQ EV Charger 202313029329",
"serial_number": "202313029329",
"part_number": "861-02006 09",
"sku": "IQ-EVSE-NA-1060-0100-0100",
"model": "IQ-EVSE-60R",
"status": "normal",
"active": "true",
"firmware": "v0.04.17"
}
]
}
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
403
Forbidden

Example Value
Model
{
"message": "Forbidden",
"details": "Not authorized to access this resource",
"code": 403
}
404
Not Found

Example Value
Model
{
"message": "Not Found",
"details": "System not found for {:id=>\"1\"}",
"code": 404
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429
}
500
Internal Server Error

Example Value
Model
{
"message": "Internal Server Error",
"details": "unable to fetch data",
"code": 500
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/retrieve_system_id
Retrieve system for a given envoy serial number

Get system ID by passing envoy serial number. If the serial number of a retired envoy is passed in the request param, a 404 Not Found response will be returned.

Parameters
Name Description
serial_num \*
string
(query)
Envoy Serial Number

serial_num
Responses
Response content type

application/json
Code Description
200
search_system_id

Example Value
Model
{
"system_id": 123
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
404
Not Found

Example Value
Model
{
"message": "Not Found",
"details": "Envoy not found with this serial number",
"code": 404
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
422
Unprocessable Entity

Example Value
Model
{
"message": "Unprocessable Entity",
"details": "Provide envoy serial number",
"code": 422
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429,
"period": "minute",
"period_start": 1623825660,
"period_end": 1623825720,
"limit": 5
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/{system_id}/events
To retrieve the list of events for a site

This endpoint is used to retrieve the events for a site. start_time is mandatory and cannot be older than 9 months from the current time. Maximum 1 week of data can be retrieved in a single call.

An Event is triggered when a site/device meets a pre-defined set of conditions. Each of these pre-defined set of conditions is called an “Event type”. These conditions are defined at both site and device level, therefore events can be triggered at both site and device level. Each event is associated with an event type.

Most Event types (not all) further have pre-defined configurations. Whenever an Event of a given Event type meets these pre-defined configurations, then the Event triggers an Alarm. An example of pre-defined configuration for an event type is - Event status is “Open” beyond a certain time limit.

Events are generated when a site or device meets specific, predefined conditions. These conditions are grouped into what we call “Event types.” Each event is always linked to an event type. For example, ‘Gateway not reporting’ is an event type and an event gets created on a site if the gateway stops reporting. Similarly, if a gateway on another site stops reporting, another event is created specific to that site with the same event type.

Many event types (though not all) come with predefined escalation criteria for alarms. When an event meets these configurations, it can trigger an alarm. For example, a common configuration might specify that an event should trigger an alarm if its status remains “Open” beyond a certain time threshold.

Parameters
Name Description
system_id \*
integer
(path)
The unique numeric ID of the system.

system_id
start_time \*
integer
(query)
Requested start time of the events data in Epoch time format.

start_time
end_time
integer
(query)
Requested end time of the events data in Epoch time format. Defaults to minimum (start time + 1 day, current time)

end_time
Responses
Response content type

application/json
Code Description
200
List of events

Example Value
Model
{
"events": [
{
"status": "Closed",
"event_type_id": 28,
"event_start_time": 1740213328,
"event_end_time": 1740373425,
"serial_number": "202241095486"
}
],
"system_id": 701644354
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
403
Forbidden

Example Value
Model
{
"message": "Forbidden",
"details": "Not authorized to access this resource",
"code": 403
}
404
Not Found

Example Value
Model
{
"message": "Not Found",
"details": "System not found for {:id=>\"1\"}",
"code": 404
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
422
Unprocessable Entity

Example Value
Model
{
"message": "Unprocessable Entity",
"details": "start_time is required",
"code": 422
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/{system_id}/alarms
To retrieve the list of alarms for a site

This endpoint is used to retrieve the alarms for a site. start_time is mandatory and cannot be older than 9 months from the current time. Maximum 1 week of data can be retrieved in a single call.

Many event types (though not all) come with predefined escalation criteria for alarms. When an event meets these configurations, it can trigger an alarm. For example, a common configuration might specify that an event should trigger an alarm if its status remains “Open” beyond a certain time threshold.

An Alarm is always tied to an Event, and the relationship between them can be one-to-one or one-to-many. For instance, if a site has a single battery and its State of Charge (SOC) drops below a predefined threshold, an event is created. If the SOC remains below that threshold for a specified duration, an alarm is triggered for that battery. In another scenario, if a site has multiple batteries and all of them fall below the SOC threshold, individual events are created for each battery. If the low SOC condition persists across all batteries for the defined time period, a single alarm may be triggered for all of them.

This means:

An alarm can be associated with multiple events.

But an event can be associated with only one alarm.

Parameters
Name Description
system_id \*
integer
(path)
The unique numeric ID of the system.

system_id
start_time \*
integer
(query)
Requested start time of the alarms data in Epoch time format.

start_time
end_time
integer
(query)
Requested end time of the alarms data in Epoch time format. Defaults to minimum (start time + 1 day, current time)

end_time
cleared
boolean
(query)
Filters alarms based on their status. Set to true to return cleared alarms; defaults to false to return active alarms.

--
Responses
Response content type

application/json
Code Description
200
List of alarms

Example Value
Model
{
"alarms": [
{
"id": "1082701398",
"cleared": false,
"severity": 4,
"events": [
{
"serial_number": "202241095486",
"start_date": 1737750626,
"end_date": 1737866703
}
],
"event_type_id": 28,
"alarm_start_time": 1737750626,
"alarm_end_time": null
}
],
"system_id": 701644354
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
403
Forbidden

Example Value
Model
{
"message": "Forbidden",
"details": "Not authorized to access this resource",
"code": 403
}
404
Not Found

Example Value
Model
{
"message": "Not Found",
"details": "System not found for {:id=>\"1\"}",
"code": 404
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
422
Unprocessable Entity

Example Value
Model
{
"message": "Unprocessable Entity",
"details": "start_time is required",
"code": 422
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/event_types
To retrieve the list of event_type_id along with event_description and recommended_action

This endpoint is used to retrieve the list of all available event_types. The endpoint will return list of event_type_id along with the event_description and recommended_action. If an event_type_id is passed, this endpoint will return the detail of specific event_type

Parameters
Name Description
event_type_id
integer
(query)
The unique numeric ID of the event type.

event_type_id
Responses
Response content type

application/json
Code Description
200
The list of event_types

Example Value
Model
{
"event_types": [
{
"event_type_id": 28,
"event_type_key": "envoy_no_report",
"stateful": true,
"event_name": "Gateway not reporting",
"event_description": "The broadband Internet connection that the Enphase gateway uses to communicate to the Enphase servers is experiencing a problem.",
"recommended_action": "Check that your gateway and Internet router are plugged in and that the site's Internet service is not experiencing an outage."
},
{
"event_type_id": 4781,
"event_type_key": "acb_sleeping",
"stateful": false,
"event_name": "AC Battery Sleeping",
"event_description": "AC Battery has entered the target state of charge band. Cleared when the battery exits the state of charge target, or sleep mode is removed.",
"recommended_action": "No action is required."
}
]
}
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
404
Not Found

Example Value
Model
{
"message": "Not Found",
"details": "Event type not found for {:id=>\"12345\"}",
"code": 404
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}

GET
/api/v4/systems/inverters_summary_by_envoy_or_site
inverters_summary_by_envoy_or_site

Returns the microinverters summary based on the specified active envoy serial number or system.

Parameters
Name Description
site_id
integer
(query)
Site id. The response will contain only those microinverters reporting to one of the active envoys of the given site.

site_id
envoy_serial_number
integer
(query)
Envoy Serial Number. Only microinverters reporting to the given envoy will be present in the response.

envoy_serial_number
page
integer
(query)
The page to be returned. Default=1, Min=1. For example, if page is set to 2, 2nd page is returned

page
size
integer
(query)
Maximum number of records shown per page. Default=10, Min=1, Max=100. For example, if max is set to 5, 5 records are shown per page

size
Responses
Response content type

application/json
Code Description
200
inverters_summary_by_envoy_or_site

Example Value
Model
[
{
"signal_strength": 5,
"micro_inverters": [
{
"id": 1059689835,
"serial_number": "688346865858",
"model": "M215",
"part_number": "800-00107-r01",
"sku": "M215-60-2LL-S22-NA",
"status": "normal",
"power_produced": {
"value": 96,
"units": "W",
"precision": 0
},
"proc_load": "521-00005-r00-v02.32.01",
"param_table": "549-00018-r00-v02.32.01",
"envoy_serial_number": "121842012242",
"energy": {
"value": 232,
"units": "Wh",
"precision": 0
},
"grid_profile": "57227c50e4d7973ae602c4e6",
"last_report_date": 1600427843
},
{
"id": 1059689836,
"serial_number": "686868727227",
"model": "M215",
"part_number": "800-00107-r01",
"sku": "M215-60-2LL-S22-NA",
"status": "normal",
"power_produced": 20,
"proc_load": "521-00005-r00-v02.32.01",
"param_table": "549-00018-r00-v02.32.01",
"envoy_serial_number": "121842012242",
"energy": {
"value": 120,
"units": "Wh",
"precision": 0
},
"grid_profile": "57227c50e4d7973ae602c4e6",
"last_report_date": 1600427843
}
]
}
]
401
Authentication Error

Example Value
Model
{
"message": "Not Authorized",
"details": "User is not authorized",
"code": 401
}
405
Method Not Allowed

Example Value
Model
{
"reason": "405",
"message": [
"Method not allowed"
]
}
422
Unprocessable Entity

Example Value
Model
{
"message": "Unprocessable Entity",
"details": "Envoy serial number or Site id mandatory",
"code": 422
}
429
Too Many Requests

Example Value
Model
{
"message": "Too Many Requests",
"details": "Usage limit exceeded for plan Kilowatt",
"code": 429,
"period": "minute",
"period_start": 1623825660,
"period_end": 1623825720,
"limit": 5
}
501
Not Implemented

Example Value
Model
{
"reason": "501",
"message": [
"Not Implemented"
]
}
