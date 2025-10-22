Quick Guide for FlexOM-PP-Meter
Environment
Operating Temperature Range
-40℃ ~ 60℃ (-40℉~ 140℉)
Relative Humidity
4% ~ 85%
Max. Operating Altitude
4,000 m (13,123 ft.)
Mechanical
Dimensions (W _ H _ D)
350 _ 550 _ 190 mm
Weight
19 kg
Protection Degree
IP65
Installation Options
Wall Mounting, Pole Mounting
Include component
NEMA4 enclosure
Breaker, 3P 600V
Transformer, 600/480/240/208V Primary, 110V Secondary
Gateway built-in 4G module, optional data plan
AC-DC Power supply, 85~264 VAC input, 12V output, 40W
10/17/2021
Revision 2
System Diagram of FlexOM-PP-Meter
0
110
Vin G
A+ B- G
Flex Gateway
Antenna
Ethernet
V+ V-
Transformer
Power
Supply
AUX Port
FOMlink
A+ B- G
N L
600
480
240
208
0
Ground Terminals
A+ B- G
VN
A+ B-
RS485
Surge
A+ B-
Gland7
Gland6
Connect to 3rd party data logger
Gland5
Opt. Meter
VC
VB
CT1
CT2
CT3
VA
LA LB LC
Breaker
Gland4
Gland3
L1 L2 L3
Gland2
Cable Gland1
Inverter
ID: 1
Inverter
ID: 32
Weather
Sensor
Gateway can connect up to 32 devices through RS485 interface.
Don’t use the Modbus ID 165 (A5H/0XA5).
It is reserved for broadcast commands of CPS inverters.
Page 1
FlexOM-PP-Meter
is equipped with a NEMA4 enclosure
Gateway is its core component.
Mount the gateway to the DIN rail with clip.
Then fix the antenna in a suitable position
outside the chassis.
Gateway with enclosure
Antenna Cable
Page 2
FlexOM-PP-Meter pole mounting
Front U-rail
Nut M8
Chassis hook
Rear U-rail
Long rod bolt M8
Chassis hanging hole
Page 3
FlexOM-PP-Meter wall mounting
Drilling holes in the wall
Expansion screw sleeve
Front U-rail
Chassis hook
Self-tapping screw
Chassis hook
Wrench
Use a wrench to adjust the hook screw to
fasten the chassis to the bracket.
The back of the chassis hook
Page 4
Key Interfaces
Caution:
FlexOM SIM can only be used in FlexOM gateway. By default, FlexOM gateway supports
customers' unrestricted use of the existing and future remote O&M functions of CPS portal.
SO DATA PLAN CONSUMPTION STATISTICS ARE NOT PROVIDED.
At the same time, FlexOM gateway does not guarantee the 3rd party SIM card. The user
needs to manually enter the APN.
FlexOM hardware warranty is valid by default within the validity period of our data plan.
SIM Card Slot
Ethernet Port
Connector of
4G Antenna
1)Pull to open the slot 2) Open the cover of slot.
Place the chip of the SIM card facing down, with
the notch facing the corresponding position of the
card slot seat, and put it into the card slot.
3)Pull to close the slot
Page 5
Internet interface : Ethernet
If the gateway is connected to the Internet using Ethernet
instead of 4G.
Open the LAN firewall ports before commissiong !
The following ports must be opened both ways (incoming and
outgoing communications):
TCP 1884 with destination IP 47.254.52.209
(mqtt.chintpowersystems.com)
Internet interface : 4G
FlexOM SIM card supports AT&T + T-mobile at the same time.
After the gateway is powered on and works normally, it will select and
connect to the provider network with the strongest or most stable signal.
If you need to purchase FlexOM SIM, please contact CPS US sales staff
for detailed information.
Scan the QR-code to complete APP download and
installation by using the mobile phones that can
access the Internet.
Or search for “CPS Connect Pro” in Apple Store
and Google Play.
Page 6
Interfaces on FlexOM Main Board
B
External installation option
RS485 Port B
Vin GND A+ B- G
Caution:
Before configuring the gateway,
pay attention to set the power switch to ON.
Caution:
If the length of the cable connecting to RS485 port or AUX port of
the gateway is over 1000 meters, the Switch button must be set to ON.
POWER ON
Default
ON
Power Switch
1
Terminating Resistance
Switch
Module Socket
A
Internal installation option
RS485 Port A
FOMlink Port
Terminating Resistance
Switch
AUX Port
A+ B- G
Page 7
Installation Option
A
Internal in Wire-Box of the Inverter
3rd Party Server
HTTPS/2nd MQTT
CPS Server
Primary MQTT
Inverter Inverter
Inverter
Wire Box
Router
RS485
FOMlink + CPS Connect Pro APP
When the inverters are monitored via the gateway, a unique RS-485 address for each
inverter can be set up through the LCD interface.
Up to 32 inverters can be connected in the daisy chain network, and different FlexOM
packages have different specific number restrictions.
Page 8
Inverter Wire-Box
The Communication Board of Inverter
Remove the (3) screws that attach
the inverter communication board in
the Wire-Box using a #2 Phillips bit.
1
Inverter’s RS485 Port
2 Replace the screws with the (3)
standoffs included in the gateway kit.
6-PIN Header
Install the gateway by carefully align-
ing the 6-PIN connector in the upper
left-hand corner of the communication
board.
6-PIN Connector
3
Install the (3) screws into the stand-
offs to secure the gateway in place.
Install the 3 screws and torque to 7
in-lbs using a #2 Phillips bit.
Page 9
Connect the 3rd party Datalogger to the AUX port in the bottom left-hand corner
of the gateway using the 3-Pin Connector provided in the gateway kit.
4
RS485 of 3rd Party Data Logger
A + / B - / G
Optional wire
Optional wire
RS485 Inverter Daisy Chain
A + / B - / G
Connect the RS485 inverter daisy chain to the inverter communication board using
the 5-Pin Connector provided in the gateway kit.
NOTE: The 5-Pin Connector is installed on the port on the bottom of the inverter
communication board (behind the gateway) .
A+ B- G
Vin GND A+ B- G
5
The RJ45 LAN cable is inserted into
the Ethernet port of the gateway.
The LAN cable must be able to access
the Internet without port filtering behind
the firewall.
Ethernet Port
Page 10
POWER ON Before closing the cover of
inverter wire-box, check again
that the gateway’s power
switch is set to on.
Screw one end of the antenna
cable into the cable connector
of the gateway.
7
6e
Pass the cable through the
disassembled cable gland
parts in sequence, then tighten
the cable glands again.
6d
6c
6b
6a
8
Screw the other end of the antenna cable into the antenna.
Page 11
Installation Option
External in a NEMA4 enclosure B
37 mm
90 mm
93 mm
The gateway may be installed in an enclosure as shown.
The gateway enclosure includes a DIN rail mounting clip for installation in a
NEMA4 communication box (FlexOM Suite) .
Open the gateway enclosure and Install the (4) screws into the standoffs to
secure the gateway in place.
Page 12
System Diagram for RS485 Pass-through
The RS485 interface of the third-party controller is connected to the AUX interface of the
gateway, which is equivalent to a direct transmission connection with a daisy chain.
Inverter or ESS
RS485 Cable
CPS
Portal
RS485 Cable
3rd Party Data Logger
/ SCADA
3rd Party
Portal
Page 13
System Diagram for Modbus/TCP Pass-through
The gateway can be used as a modbus/TCP server, connect to a third-party SCADA
system, and forward various commands to the daisy chain.
Inverter or ESS
RS485 Cable
CPS
Portal
Ethernet Cable
3rd Party Data Logger
/ SCADA
3rd Party
Portal
Page 14
System diagram of mixed connection of different hardware brands
The gateway allows users to connect different brands and models of hardware in the same
daisy chain via RS485. The connected hardware needs to be pre-compatible with FlexOM.
If the user's hardware is not yet compatible, CPS US will complete the compatibility free of
charge.
Inverter or ESS
Model A Model B
Meter Weather
Sensor
EV Charger
RS485 Cable
CPS
Portal
RS485 Cable
3rd Party Data Logger
/ SCADA
Page 15
Use Cases for System Design
Inverter
RS485 By default, the gateway is connected to the
inverter through the RS485 interface.
Inverter
1
TTL / RS232 / 485
option
The RS485 interface of the third-party
controller is connected to the AUX interface
of the gateway, which is equivalent to a
direct transmission connection with a daisy
chain.
7
RS485
3rd Party
Controller

- SCADA
  3rd Party
  Server
  HTTP POST /
  extra MQTT
  5
  The gateway sends raw data unidirectionally
  to a third-party server via HTTPS/ extra
  MQTT.
  8
  3rd Party
  Controller
- SCADA
  The gateway can be used as a Modbus/TCP server, connect
  to a third-party SCADA system, and forward various
  commands to the daisy chain.
  RS485
  DC-PLC
  TCP/IP AUX
  BLE
  Ethernet Modbus/TCP Certain models provide multiple RS485
  interface.
  2
  option
  RSD
  APP
  3
  The APP connects to the gateway
  through BLE 4.2 for on-site
  configuration and diagnosis.
  4
  Portal provides the flexibilities of
  remote O&M.
  Open API
  6
  Third-party servers can use the
  open API of portal to develop their
  own business systems.
  4G
  MQTT
  CPS
  Portal
  3rd Party
  Server
  INV
  / ESS
  Modbus/TCP via Ethernet port
  7
  3rd party data logger
  / SCADA
  AUX port for RS485 pass-thru
  8
  4 6
  MQTT Open API
  CPS
  3rd party
  portal
  server
  RSD
  2
  / Panel level monitoring
  On-site configuration
  and diagnosis
  3
  HTTP POST / extra MQTT
  5
  Page 16
  Setup the gateway
  Installation OM Service
  CPS Connect
  Flex Gateway Dongle Gateway
  way
  20%
  Synchronizing data
  nverter Rename FOMlink
  No-LCD Inverter Rename FOMlink
  Connect to WiFi mode
  Scan Devices
  CPLK-000AA77
  V 1.0.6
  APP Settings
  When the APP starts, make sure the
  phone can access the Internet.
  APP will automatically enter the main
  panel after data synchronization.
  Click “Flex Gateway” under the “Installa-
  tion” tab.
  Ensure the D2XH cable and FOMlink are
  connected to the gateway.
  Refresh
  The APP will list the BLE name of FOM-
  link, starting with “CPLK-”, and the SN of
  FOMlink is the BLE name.
  Page 17
  Quit CPLK-000001211 Next
  Quit CPLK-000001211 Next
  <- Show Status :
  Model :
  SN :
  Hardware :
  MAC :
  Firmware :
  Status :
  Time Zone :
  Server :
  IP Address :
  INV Baud Rate :
  2021-09-16 10:21:32 GMT -6
  FG4C
  408800000000022
  2.2.2251
  00:00:5E:11:13:C0
  3.0035
  Offline
  GMT -6
  mqtt.chintpowersystems 1884
  DHCP enabled
  9600 N8 1
  -> Show Status :
  Status :
  Internet :
  INV Baud Rate :
  Modbus Range :
  APN :
  IMEI :
  ICCID :
  Secondary MQTT :
  -> Show Status :
  Status :
  Internet :
  INV Baud Rate :
  Modbus Range :
  APN :
  IMEI :
  ICCID :
  Secondary MQTT :
  2021-09-16 10:22:02 GMT -6
  Powering On
  Ethernet + 4G
  9600 N8 1
  1 - 32

*
*
*
* 2021-09-16 10:25:02 GMT -6
  Detecting SIM Card
  Ethernet + 4G
  9600 N8 1
  1 - 32
* 86682200000077
*
* Fullscreen
  Scan Daisy Chain
  Modbus ID Range
  Inverter Baud Rate
  Send Log
  Show Status
  Internet Settings
  More
  Fullscreen
  Scan Daisy Chain
  Modbus ID Range
  Inverter Baud Rate
  Send Log
  Show Status
  Internet Settings
  More
  Important : Click “Show Status” to
  display the current configuration
  parameters of the gateway.
  If there is no SIM card in the gateway, the
  APP will display "Detecting SIM card", and
  then the gateway keeps restarting the 4G
  module and displays "Powering on".
  The gateway connects to the Internet
  through 4G by default.
  In this case, it is assumed that the SIM
  card is inserted into the gateway.
  When the gateway is connected to the
  Ethernet to access the Internet.
  Click "Internet Settings" to change how
  the gateway connects to the Internet.
  Page 18
  Back Internet Settings Save
  Quit CPLK-000001211 Next
  Only the enabled interface will be used as a channel
  to connect to the Internet.
  Ethernet
  DHCP
  4G Cellular
  -> Show Status :
  Status :
  Internet :
  INV Baud Rate :
  Modbus Range :
  APN :
  IMEI :
  ICCID :
  Secondary MQTT :
  HTTPS Push :
  2020-03-16 10:30:16 GMT -6
  Online
  Ethernet + 4G
  9600 N8 1
  1 - 32
  AT&T
  123135531341433
  89898977866767756565645
  Disable
  Disable
  Back Internet Settings Save
  Only the enabled interface will be used as a channel
  to connect to the Internet.
  Ethernet
  DHCP
  4G Cellular
  Fullscreen
  Scan Daisy Chain
  Modbus ID Range
  Inverter Baud Rate
  Send Log
  Show Status
  Internet Settings
  More
  Click “4G Cellular” or “Ethernet” to enable
  this connection method.
  When returning to the previous screen,
  click “OK” to save the settings.
  Click “Show Status” to check the connec-
  tion status.
  Before the status becomes “Online”, click
  “Next” will only display “Gateway unable to
  access Internet”.
  When the gateway status becomes
  “Online”, the gateway will automatically
  create related objects on the portal, and
  the administrator can remotely set the
  required parameters.
  You can also click “Next” to modify the site
  and gateway name on site.
  Page 19
  Back New Gateway
  Site Name
  None
  Gateway Name
  None
  Country
  None
  Installation Success
  Time Zone None
  Next
  Done
  Enter the site name and gateway name,
  and then select the country and time zone
  of site.
  Click “Next” to change the settings on the
  portal.
  Page 20
  Back
  Quit CPLK-000001211 Next
  -> Show Status :
  Status :
  Internet :
  INV Baud Rate :
  Modbus Range :
  APN :
  IMEI :
  ICCID :
  Secondary MQTT :
  HTTPS Push :
  2020-03-16 10:30:16 GMT -6
  Online
  Ethernet + 4G
  9600 N8 1
  1 - 32
  AT&T
  123135531341433
  89898977866767756565645
  Disable
  Disable
  Connected the Cloud!
  Click the button to upload the log.
  Fullscreen
  Send Log
  Show Status
  Show Status
  Scan Daisy Chain
  Modbus ID Range
  Inverter Baud Rate
  Settings
  Internet Settings
  Upload
  More
  If any errors occur on site, click “Send
  Log” to request remote assistance.
  Click “Upload” to send the process of
  installation.
  Confirm your phone is set to access the
  Internet.
  Call CPS service to troubleshoot the
  issues.
  Page 21
  Click “More” to check all settings of gate-
  way.
  Fullscreen
  Scan Daisy Chain
  Modbus ID Range
  Inverter Baud Rate
  Send Log
  Show Status
  Inverter Baud Rate : Modify the baud rate
  of data transmitted between the daisy
  chain device and the gateway.
  Internet Settings
  More
  Modbus ID Range : Modify the scope of
  the gateway to scan daisy chain devices.
  Internet Settings : Change how the gate-
  way connects to the Internet.
  Back Gateway Settings
  Inverter Baud Rate
  9600 N81
  MQTT Server : Enable the secondary
  MQTT server’s parameters.
  Modbus ID Range
  1-16, 32
  HTTPS Server : Enable the HTTPS POST
  to a 3rd party’s server.
  Internet Settings
  Ethernet + 4G
  MQTT Server 2nd server disable
  Upgrade Firmware : To upgrade the gate-
  way to the latest.
  HTTPS Server Disable
  Upgrade Firmware
  Latest 3.0050
  Reboot : Only restart the gateway, it will
  not erase any settings.
  Reboot
  Reset
  Reset : This will restore the gateway to
  factory settings. All previous data on portal
  will be permanently deleted.
  Page 22
  Flex Gateway Datasheet
  Data Interfaces
  Inverter daisy chain
  Isolated RS485, Max. 32 devices
  Third-party data logger
  AUX port, Isolated 3 Pin RS485
  CPS cloud service
  Internet, Primary MQTT
  Third-party server
  Internet, HTTPS or Secondary MQTT
  SCADA client
  Ethernet port, Modbus/TCP
  Connections
  RS485 port A
  Internal installation, RS485+DC Input, 6 Pin
  RS485 port B
  External installation, RS485+DC Input, 5 Pole 3.5 mm pitch EDG
  Only one effective at the same time between port A and B
  AUX port
  RS485, 3 Pole, A+ / B- / G
  Ethernet port
  RJ45, 10Base-T / 100Base-T
  FOMlink port
  4Pin connector
  4G Cellular module
  LTE-FDD/LTE-TDD, WCDMA, GSM/EDGE
  WiFi module
  Option, 802.11 b/g/n
  Voltage supply
  Input voltage
  9 ~ 24 Vdc
  Power consumption
  < 1 W, Max. 5 W
  Ambient conditions
  Degree of protection
  Installed in inverter wire-box or NEMA4 enclosure
  Ambient temperature
  -40℃ to +85℃, Natural convection
  Relative humidity
  < 85%, Non-condensing
  General data
  Dimensions ( W/H/D)
  140 mm / 70 mm / 15 mm
  Weight
  69 g
  Service Hotline: 855-584-7168
  CHINT POWER SYSTEMS AMERICA CO., LTD.
  Email: AmericaSales@chintpower.com
  Website: www.chintpowersystems.com
  Page 23
