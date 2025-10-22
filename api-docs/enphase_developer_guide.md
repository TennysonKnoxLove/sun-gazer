Overview
Welcome to Enphase Developer Portal. As a developer and installer, leverage the portal to get access to Enphase systems’ data. Anyone can register on the platform, create an application, and can get access to the system data.

The Enphase Public API is a REST API and conforms to all the constraints of the REST architectural style and delivers data in JSON format via HTTPS. The API is categorized into 2 products:
• Monitoring API
• Commissioning API

Monitoring API can fetch system details on a site, system-level production, consumption and battery data, device-level production data, system configurations, and live status. Commissioning API can be used to create and update activations on a site, manage companies and users, update tariffs, etc.

This document provides a step-by-step guide on how to:
• Create an account on the portal
• Enter Application Details
• Choose Plan and Select Access Controls
• Authentication and Authorization Process for a Developer App
• Authentication and Authorization Process for a Partner App

Create an Account on the portal
To get started with the developer portal, sign up for a free developer account. Visit the sign up link, provide the details required on the page and proceed to sign up. You will receive an email with instructions for activating your account. Follow the instructions provided in the email to activate the account.

Note: By using the API, you agree to the Enphase Energy API License Agreement.

Enter Application details
After the account is activated, log in to the portal and proceed to the Applications page.

Fill the following fields to create a new application:
• Plan – Indicates the plan selected. By default, it will be Watt and can be altered to kilowatt or megawatt. To subscribe to the partner plan, a new application must be created.
• Name – Name of the application. The same name will be presented to the system owners when you request access to their system data. If access is authorized, the name of the application is also shown in Enphase App
• Description – A description of what your application does
• Developed By – Indicates the developer of the app. The same name will be shown in Enphase App
• Access Control – Populated based on the selected plan. By default, everything is unchecked and the selected access controls will be the scope of the application

Choose Plan and Select Access Controls
Multiple plans are available on the portal and by default, applications will be created under the Watt plan. Applications under the Watt plan can get free access to a few of the endpoints but with lower rate limits.

Developers can choose one of Watt, Kilowatt, or Megawatt plans. Depending on the plan selected, the scope of the application will be determined. For example, applications under a Watt plan can get access to System Details, Site Level Production Monitoring and Site Level Consumption Monitoring endpoints. Meanwhile, applications under a Kilowatt plan can also access device-level production monitoring endpoints and streaming APIs. Partner plan is available only to registered Enphase installers with at least 10 installations and gives access to all the Monitoring API and Commissioning API endpoints. The full list of endpoints available under each category is available on the documentation page.

After the mandatory fields are filled, proceed to ‘create application’. To subscribe to a paid plan, credit card details must be entered from the following page – Enter Payment Details. Refer to the below image for more details:

Authentication and Authorization flow for a developer application
Monitoring API follows OAuth 2.0 for authorization. Each API request must include an OAuth 2.0 access token along with the API key of your application.

The below flow chart details the authentication and authorization flow for a developer application:

1. Account and Application Creation
   Sign up and create an application under Watt/Kilowatt/Megawatt plan. Credit Card details must be provided in case of the paid plan. In the below example, a new application is created under Watt plan with only ‘System Details’ selected

2. Application Details

An API Key, Auth URL, Client ID, and Client Secret are generated for the application. These are unique for an application and can be viewed from the applications tab

3. Auth URL

To start making API requests, the application must be authorized by the system owner. The Auth URL must be sent to the system owner via email or must be embedded in the HO App created by the developer. For the above app, Auth URL is https://api.enphaseenergy.com/oauth/authorize?response_type=code&client_id=f2a479f3c6067f0d9517cadae7f00b47

4. Append Auth URL with redirect_uri

The Auth URL must be appended with redirect_uri as a query parameter and after HO approves, the authorization code is sent to this redirect_uri as a query parameter. You can provide your own Web API or webhook URL in the redirect_uri or you can use https://api.enphaseenergy.com/oauth/redirect_uri as a default redirect_uri.

If the default redirect uri is used, the final Auth URL must be similar to For the above app, Auth URL is https://api.enphaseenergy.com/oauth/authorize?response_type=code&client_id=f2a479f3c6067f0d9517cadae7f00b47&redirect_uri=https://api.enphaseenergy.com/oauth/redirect_uri

5. Append Auth URL with state parameter

The Auth URL can also be appended with a state parameter as a query parameter for additional security. The same state parameter is returned to the redirect_uri after HO authorizes it. The state parameter could be used to map the returned authorization code to the system owner.

6. HO authorization

When a Homeowner opens the Auth URL, Enlighten login credentials must be provided to proceed. Homeowners will be redirected to the Authorization page and shown the application details and scope. The HO can Approve or Reject application access to their systems.

7. Retrieve auth code from redirect_uri

After HO authorizes, a get HTTP request is sent to the redirect_uri and HO is redirected to the redirect_uri. If HO approves access, an auth code is generated and sent to the redirect_uri as a query parameter, whereas an ‘access_denied’ error message is sent as query parameter in case of rejection.

In the above scenarios, default redirect_uri (https://api.enphaseenergy.com/oauth/redirect_uri) is used and you must reach out to HO to receive the auth code. The best practice is to use your own Web API or webhook URL as the redirect_uri so that you can retrieve the auth code on your own without the need to approach the HO. A get HTTP request is sent to the redirect_uri with the auth code as a query parameter.

8. Generate OAuth2 access_token and refresh_token

To generate an access token, a post request must be sent to https://api.enphaseenergy.com/oauth/token with the following parameters

URL: https://api.enphaseenergy.com/oauth/token
grant_type: ‘authorization_code’
redirect_uri: It must be the same URI that was sent to HO. In this example, it is ‘https://api.enphaseenergy.com/oauth/redirect_uri’
code: Code generated after HO approval. In this example, it is ‘2TJk7M’.

The client id and client secret of the client application must be sent as basic authorization header in base64encoded(“client_id:client_secret”). For example, if your client_id is “abcd” and client_secret is “uvwxyz”, then base64_encoded(“abcd:uvwxyz”) is ‘YWJjZDp1dnd4eXo=’ and the value for basic authorization header is ‘Basic YWJjZDp1dnd4eXo=’.

An access_token will be generated and the user can start making API requests using the access_token and API key of the application. For more details, please refer to the sample request and response given below.

The validity of access_token is ‘1 day’ and of refresh_token is ‘1 month’ for applications under Watt/ Kilowatt/ Megawatt Plan.

Sample Request

cURL

curl --location --request POST 'https://api.enphaseenergy.com/oauth/token?grant_type=authorization_code&redirect_uri=https://api.enphaseenergy.com/oauth/redirect_uri&code=2TJk7M' \
--header 'Authorization: Basic ZjJhNDc5ZjNjNjA2N2YwZDk1MTdjYWRhZTdmMDBiNDc6NTAzNWNhNjRjMTNmNzkzYTdjMWJjYTQzNTU5MWQ1ZWE='

</pre>

Sample Response
{
"access_token": "unique access token",
"token_type": "bearer",
"refresh_token": "unique refresh token",
"expires_in": 86393,
"scope": "read write",
"enl_uid": "217231",
"enl_cid": "5",
"enl_password_last_changed": "1638870641",
"is_internal_app": false,
"app_type": "system",
"jti": "1ee68d30-3e79-4347-b7ea-a5851f6f15db"
}

9. Making an API request
   The user can start making API requests using the generated access_token and the api_key of the application.

Sample Request

cURL

curl --location -g --request GET 'https://api.enphaseenergy.com/api/v4/systems?key=b2b2fd806ed13efb463691b436957798' \
--header 'Authorization: Bearer unique_access_token'

</pre>

h4. Sample Response

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Status: 200
{"total":28,"current_page":1,"size":2,"count":2,"items":"systems","systems":[{"system_id":698910067,"name":"Enphase System","public_name":"Residential System","timezone":"Australia/Sydney","address":{"city":"Sydney","state":"NSW","country":"AU","postal_code":"2127"},"connection_type":"ethernet","energy_lifetime":-1,"energy_today":-1,"system_size":-1,"status":"micro","last_report_at":1508174262,"last_energy_at":1508174172,"operational_at":1497445200,"attachment_type":null,"interconnect_date":null,"reference":"106015287","other_references":["106015287"]},{"system_id":698906018,"name":"Enphase Public System","public_name":"Residential System","timezone":"US/Pacific","address":{"city":"Los Angeles","state":"CA","country":"US","postal_code":"94954"},"connection_type":"ethernet","energy_lifetime":-1,"energy_today":-1,"system_size":-1,"status":"normal","last_report_at":1508174262,"last_energy_at":1508174172,"operational_at":1497445200,"attachment_type":null,"interconnect_date":null}]}

10. Generate new access_token and refresh_token using refresh_token
    If the access_token expires, a new access token can be generated using the Client ID, Client Secret, and refresh_token. Along with the new access token, a new refresh token is also generated.
    To generate a new access token, post a request to https://api.enphaseenergy.com/oauth/token with grant_type = refresh_token and refresh_token = ’Application’s refresh_token’ as query parameters. Additionally, the client id and client secret of your application must be sent in the basic authorization header in base64encoded format. For example, if your client_id is ‘abcd’ and client_secret is ‘uvwxyz’, then base64_encoded(abcd:uvwxyz) is ‘YWJjZDp1dnd4eXo=’ and the value for basic authorization header is ‘Basic YWJjZDp1dnd4eXo=’. For more details, please refer to the sample request and response given below.

Sample Request

cURL

curl --location --request POST 'https://api.enphaseenergy.com/oauth/token?grant_type=refresh_token&refresh_token=unique_refresh_token' \
--header 'Authorization: Basic ZjJhNDc5ZjNjNjA2N2YwZDk1MTdjYWRhZTdmMDBiNDc6NTAzNWNhNjRjMTNmNzkzYTdjMWJjYTQzNTU5MWQ1ZWE='

</pre>

Sample Response

{
"access_token": "unique access token",
"token_type": "bearer",
"refresh_token": "unique refresh token",
"expires_in": 86393,
"scope": "read write",
"enl_uid": "217231",
"enl_cid": "5",
"enl_password_last_changed": "1638870641",
"is_internal_app": false,
"app_type": "system",
"jti": "1ee68d30-3e79-4347-b7ea-a5851f6f15db"
}

Authentication and Authorization flow for a partner application

Partner API follows OAuth 2.0 for authorization. Each API request must include an OAuth 2.0 access token along with the API key of your application.

The below flow chart details the authorization and authentication flow for a partner application:

1. Account and Application Creation

Sign up to the developer portal and create an application under the Partner plan. Partner plan is available only to Installers and hence, Enlighten credentials must be provided before an application is created. A user will be allowed to create a Partner application only if the user is a self-installer or belongs to an installer company and installed at least 10 systems.

2. Application Details

If the Enlighten credentials of the installer are verified, an application is created
An API Key, Client ID, and Client Secret are generated for the application. These are unique for an application and can be viewed from the applications tab. The application will be in a pending state initially and is enabled after verification

3. Generate OAuth2 access_token and refresh_token

The installer can generate access and refresh tokens using the Client ID and Client Secret of the application. To generate an access token, a post request must be sent to https://api.enphaseenergy.com/oauth/token with the following parameters

URL: https://api.enphaseenergy.com/oauth/token
username: Enlighten email of the user
password: Enlighten password of the user
grant_type: ‘password’

The client id and client secret of the client application must be sent as basic authorization header in base64encoded(“client_id:client_secret”). For example, if your client_id is “abcd” and client_secret is “uvwxyz”, then base64_encoded(“abcd:uvwxyz”) is ‘YWJjZDp1dnd4eXo=’ and the value for basic authorization header is ‘Basic YWJjZDp1dnd4eXo=’.

An access token will be generated and the user can start making API requests using the access token and API key of the application. For more details, please refer to the sample request and response given below.

The validity of access_token is ‘1 day’ and of refresh_token is ‘1 month’ for applications under Partner Plan.

cURL

curl --location --request POST 'https://api.enphaseenergy.com/oauth/token?grant_type=password&username=your_enlighten_email&password=your_enlighten_password' \
--header 'Authorization: Basic ODBkYmQzYjU4MTM0ZTI4m2EwY2Y3NDUyODFmY2Y2NTk6ZGNkYWQxZjVjZDQxMzJjYTUzN2Y3MjY2NGRiZjMxMDQ='

</pre>

Sample Response

{
"access_token": "unique access token",
"token_type": "bearer",
"refresh_token": "unique refresh token",
"expires_in": 86393,
"scope": "read write",
"enl_uid": "217231",
"enl_cid": "5",
"enl_password_last_changed": "1638870641",
"is_internal_app": false,
"app_type": "partner",
"jti": "1ee68d30-3e79-4347-b7ea-a5851f6f15db"
} 4. Making an API request

The user can start making API requests using the generated access_token and the api_key of the application.
Sample Request

cURL

curl --location -g --request GET 'https://api.enphaseenergy.com/api/v4/systems?key=4a6580c04b9e6282058df02d6454e659' \
--header 'Authorization: Bearer unique_access_token'

</pre>
Sample Response

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Status: 200
{"total":28,"current_page":1,"size":2,"count":2,"items":"systems","systems":[{"system_id":698910067,"name":"Enphase System","public_name":"Residential System","timezone":"Australia/Sydney","address":{"city":"Sydney","state":"NSW","country":"AU","postal_code":"2127"},"connection_type":"ethernet","energy_lifetime":-1,"energy_today":-1,"system_size":-1,"status":"micro","last_report_at":1508174262,"last_energy_at":1508174172,"operational_at":1497445200,"attachment_type":null,"interconnect_date":null,"reference":"106015287","other_references":["106015287"]},{"system_id":698906018,"name":"Enphase Public System","public_name":"Residential System","timezone":"US/Pacific","address":{"city":"Los Angeles","state":"CA","country":"US","postal_code":"94954"},"connection_type":"ethernet","energy_lifetime":-1,"energy_today":-1,"system_size":-1,"status":"normal","last_report_at":1508174262,"last_energy_at":1508174172,"operational_at":1497445200,"attachment_type":null,"interconnect_date":null}]}
The application can access system data by sending requests using the API key and access token

5. Generate new access_token and refresh_token using refresh_token
   If the access_token expires, a new access token can be generated using the Client ID, Client Secret, and refresh_token. Along with the new access token, a new refresh token is also generated.
   To generate a new access token, post a request to https://api.enphaseenergy.com/oauth/token with grant_type = refresh_token and refresh_token = ’Application’s refresh_token’ as query parameters. Additionally, the client id and client secret of your application must be sent in the basic authorization header in base64encoded format. For example, if your client_id is ‘abcd’ and client_secret is ‘uvwxyz’, then base64_encoded(abcd:uvwxyz) is ‘YWJjZDp1dnd4eXo=’ and the value for basic authorization header is ‘Basic YWJjZDp1dnd4eXo=’. For more details, please refer to the sample request and response given below.

Sample Request

cURL

curl --location --request GET 'https://api.enphaseenergy.com/oauth/token?grant_type=refresh_token&refresh_token=unique_refresh_token' \
--header 'Authorization: Basic ZjJhNDc5ZjNjNjA2N2YwZDk1MTdjYWRhZTdmMDBiNDc6NTAzNWNhNjRjMTNmNzkzYTdjMWJjYTQzNTU5MWQ1ZWE='

</pre>

Sample Response

{
"access_token": "unique access token",
"token_type": "bearer",
"refresh_token": "unique refresh token",
"expires_in": 86393,
"scope": "read write",
"enl_uid": "217231",
"enl_cid": "5",
"enl_password_last_changed": "1638870641",
"is_internal_app": false,
"app_type": "partner",
"jti": "1ee68d30-3e79-4347-b7ea-a5851f6f15db"
}
