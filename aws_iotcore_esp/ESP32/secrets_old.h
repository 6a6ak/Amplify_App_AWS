#ifndef SECRETS_H
#define SECRETS_H

#include <pgmspace.h>

#define SECRET

// ---------------------------------------------------------------------------
// WiFi credentials
// ---------------------------------------------------------------------------
const char WIFI_SSID[] = "4-1328";
const char WIFI_PASSWORD[] = "rzjpRPXpRg";

// ---------------------------------------------------------------------------
// AWS IoT endpoint
// ---------------------------------------------------------------------------
const char AWS_IOT_ENDPOINT[] = "a2v6h6fq7j6lhc-ats.iot.eu-central-1.amazonaws.com";

// ---------------------------------------------------------------------------
// Amazon Root CA 1
// ---------------------------------------------------------------------------
static const char AWS_CERT_CA[] PROGMEM = R"PEM(
-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
-----END CERTIFICATE-----
)PEM";

// ---------------------------------------------------------------------------
// Device Certificate
// ---------------------------------------------------------------------------
static const char AWS_CERT_CRT[] PROGMEM = R"PEM(
-----BEGIN CERTIFICATE-----
MIIDWTCCAkGgAwIBAgIUckss5R025L9j8qYkjJS9PetyFJ0wDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI1MTEwNzA4MjYz
MFoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJQ03dL3bmQwZ+Mi69Ph
n512+c4NewO/bypbJxZ8t4gCjZMzWxVttO/0BBBoZjkvqfK050/GSY8jO6vt+Asc
szN/tJFUNZk6DQX4GLXIeh7v+E1rxU2Z6u0kA5Gcfu04QPeVjAsrSMJDEfaf43Rt
O8TBlUN3XWHeBVnBBwDCDeYdMgGSoC43sF6V2+QDOH9CrV7b5kLKbJdRwsM/iuY3
7vgmgkQubg2OTIcIeRIjFH4+w2k8Zg0pXE5SmkC0wDAZk/RJZnAl5flpNVPtJSE/
niixEbPlJAfUvoOK3UrjENulRNSjFswLsN+EcKrqC6ryi/iIJ45sKGNMk8lI62rb
VFMCAwEAAaNgMF4wHwYDVR0jBBgwFoAUaMFuKvKlxdKsOA+ZQzd2qKP1lDowHQYD
VR0OBBYEFC52SlmkZ2YhpDDmpjgPRiFsxRwSMAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQBlvt/bEUCVWRA4Q1hXCwd9VWSF
7fn9dm7ecyQrb9rzwOgDxRgp/WtgAyySvE/Q6yvMK82XASU7+YKDuaXYTTnFWAI9
tM2gLHzSogqWCbFOGSAJ8MGuLSnl3J7uuEcJz5i4wg4R4OKsJ3sPjwGNDFERlcXQ
GeifidoLMOS/l3F3wmzOWBMyujHT+OHE0ekQsfrRrqCuGTcBpShnQSQPDsVhnoyY
OV6px0+Kz/i6hVNeW9P9Dv9+EhL9b+eVn+fCam62Vpy3zRdiOHK2olPCjJCR/Ym9
8lOHhJnCigpLYb2hWp7GPId88zPf2pQR9CPfltkJBd47sh8/Z0thWNjA9IDy
-----END CERTIFICATE-----
)PEM";

// ---------------------------------------------------------------------------
// Device Private Key
// ---------------------------------------------------------------------------
static const char AWS_CERT_PRIVATE[] PROGMEM = R"PEM(
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAlDTd0vduZDBn4yLr0+GfnXb5zg17A79vKlsnFny3iAKNkzNb
FW207/QEEGhmOS+p8rTnT8ZJjyM7q+34CxyzM3+0kVQ1mToNBfgYtch6Hu/4TWvF
TZnq7SQDkZx+7ThA95WMCytIwkMR9p/jdG07xMGVQ3ddYd4FWcEHAMIN5h0yAZKg
LjewXpXb5AM4f0KtXtvmQspsl1HCwz+K5jfu+CaCRC5uDY5Mhwh5EiMUfj7DaTxm
DSlcTlKaQLTAMBmT9ElmcCXl+Wk1U+0lIT+eKLERs+UkB9S+g4rdSuMQ26VE1KMW
zAuw34RwquoLqvKL+IgnjmwoY0yTyUjrattUUwIDAQABAoIBADaG/NYRktvps08u
GfXqnP8iNuZIr2nBlPTQdKEhYaT4y33M90X7BwcBkD05K+L+VlilljUTjxzKqbmn
5AqylHvuEFEn2lB1uzTnArBfAg8/2ushK4ZRis2U4ntASLKeb8injM7PLgXLB2Dl
kpnTVpodXv1jfUf0l6NeEWWF//cZV2gdNs0UsnOWPX8M9+Qclm3asVMQke0tcFKX
Aql/ytL6DubVj09eVuQ6xPsAfIkX0hc6WC9y6VnqZ3ei7d5BFS1kgxoL6mOZBHq6
MUwmpw2eBlwxzujmtxYtJ0in+6OBzFKp+6yv/c3WDS6ZUT7M7uewqi+TVe0+YP9/
OidU9QECgYEAwwvUE6XvdUFm3Ne4h/VgcqDEpVFAqg230PtHF7J3L9VSTcrQx2gS
LnEHXvTuoQjAl0KX3+ERumDvMn4Il0zMd5HFLD19b0OTao7upFkeQXCjTVCmu6Ha
lt2I5KHOz9NUz8iOJ8QwA+6xCk+KfyTbhx332FuC4xoakDXsTQWodQsCgYEAwoW/
lGg5SXcf3bJRPbE/NV2XLW6Lk1Yi465pXEOGbxiVq+LPZri0nnu9u/FRwlk/XsiS
A5rm9IULvFYDPyD6AY+ZoE6ym+r4MNLwGyE6zysspFfGh18fW342UchX/PX+v+oK
P9HiW+8WCxXTZ5Mwhj+krKCBltG6cP86thunGtkCgYBfvq+1kXAxxBAlerO38ekN
fAPsDy3KDH/eU2s7o7zEO1hynYvNRzYdnBh9MYjufehkmCkLmmVkc28X/yxicS2x
yFnc9LZdZvO3jEBzZtfmUc+oBV5Dnxk5k7g+W3u1I01vzkiSFslnNMWthQw8i7BD
7J8ckxd2OfsuLXo4+P0PrwKBgQCZnyEOpkTfxQlQf1vzmcBud8xFn/Dw2ezR3NLu
f5FyuXqydXwQBrz2EIlmHQ3Rq8QFKedOm43b/BqpkVAdEgD/LJZJ6Pzbb/S0MlJX
SqX0KIen/n4WOMQ98G4bpln+t5OJot6XSj03F5lUBdegC7kdvLNjdZsCLf3M8XQ/
j5Un+QKBgQCi6njqDEgEfPrYmU4ZVBHD1HYA/QyqC+mppqyl7WUXaq0HV8RsDDJc
wuub4z/Eb8lByXd7APFFGewv4DnZEqwzLqDx2uiZyu37ZESgC8TwpS+bo6X1vquQ
ZE3d7mCJ4YBsqwXNKxQhIuS05KodPLZW8fe9+4uYs5uNQOvxhjGwFA==
-----END RSA PRIVATE KEY-----
)PEM";

#endif // SECRETS_H
