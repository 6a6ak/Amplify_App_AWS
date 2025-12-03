// secrets.template.h
// Template file for local secrets. Copy to `secrets_real.h` and fill in
// real values on your machine. Do NOT commit `secrets_real.h`.

#ifndef SECRETS_TEMPLATE_H
#define SECRETS_TEMPLATE_H

// WiFi credentials
const char WIFI_SSID[] = "<YOUR_WIFI_SSID>";
const char WIFI_PASSWORD[] = "<YOUR_WIFI_PASSWORD>";

// AWS IoT endpoint (example: a1b2c3d4e5f6g-ats.iot.eu-central-1.amazonaws.com)
const char AWS_IOT_ENDPOINT[] = "<YOUR_AWS_IOT_ENDPOINT>";

// If you need to include certificate placeholders in local files,
// create `secrets_real.h` locally with the real PEM blocks. Keep
// `secrets_real.h` out of version control (it's already in `.gitignore`).

#endif // SECRETS_TEMPLATE_H
