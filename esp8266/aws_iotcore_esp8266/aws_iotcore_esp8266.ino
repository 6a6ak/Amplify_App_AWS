#include "secrets.h"
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <MQTTClient.h>
#include <ArduinoJson.h>

#define AWS_IOT_PUBLISH_TOPIC   "/telemetry"
#define AWS_IOT_SUBSCRIBE_TOPIC "/downlink"

long sendInterval = 10000;
String THINGNAME = "";

WiFiClientSecure net;
MQTTClient client(1024);

void connectAWS();
bool publishTelemetry(String payload);
void messageHandler(String &topic, String &payload);

void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  THINGNAME = WiFi.macAddress();
  THINGNAME.replace(":", "");

  Serial.println("\nMAC Address (THINGNAME): " + THINGNAME);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected - IP: " + WiFi.localIP().toString());

  BearSSL::X509List rootCert(AWS_CERT_CA);
  BearSSL::X509List clientCert(AWS_CERT_CRT);
  BearSSL::PrivateKey privateKey(AWS_CERT_PRIVATE);

  net.setTrustAnchors(&rootCert);
  net.setClientRSACert(&clientCert, &privateKey);
  net.setInsecure();   // Allow CA Validation only
  net.setBufferSizes(512, 512);

  client.begin(AWS_IOT_ENDPOINT, 8883, net);
  client.onMessage(messageHandler);

  Serial.print("Connecting to AWS IoT ");
  int retries = 0;
  while (!client.connect(THINGNAME.c_str()) && retries < 40) {
    Serial.print(".");
    delay(500);
    retries++;
  }

  if (!client.connected()) {
    Serial.println("\n✘ AWS IoT Connection FAILED! Restarting...");
    delay(2000);
    ESP.restart();
  }

  client.subscribe(THINGNAME + AWS_IOT_SUBSCRIBE_TOPIC);

  Serial.println("\n✔ AWS IoT Connected Successfully!");
}

bool publishTelemetry(String payload) {
  Serial.print("Publishing: ");
  Serial.println(payload);
  return client.publish(THINGNAME + AWS_IOT_PUBLISH_TOPIC, payload);
}

void messageHandler(String &topic, String &payload) {
  Serial.println("Received: " + topic + " → " + payload);
}

void setup() {
  Serial.begin(115200);
  delay(1500);
  connectAWS();
}

void loop() {
  static unsigned long prevMillis = 0;

  if (millis() - prevMillis >= sendInterval) {
    prevMillis = millis();

    String payload =
  "{\"temperature\":" + String(random(20, 28)) +
  ",\"speed\":" + String(random(50, 120)) +
  ",\"humidity\":" + String(random(10, 100)) +
  ",\"name\":\"Odenplan\"" +",\"plate\":\"XET 13D\"" +
  ",\"from\":\"ESP8266\"}";


    if (!publishTelemetry(payload)) {
      Serial.println("Publish Failed → Restarting...");
      delay(2000);
      ESP.restart();
    }
  }

  client.loop();
  delay(10);
}
