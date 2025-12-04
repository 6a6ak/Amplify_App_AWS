#include "secrets.h"
#include <WiFiClientSecure.h>
#include <MQTTClient.h>
#include <ArduinoJson.h>
#include <WiFi.h>

// ------------------------------------------------------
// Ultrasonic Pins
// ------------------------------------------------------
const int trig1 = 5;
const int echo1 = 18;
const int trig2 = 4;
const int echo2 = 19;

const float DETECT_CM = 10.0;
const float SENSOR_DISTANCE_CM = 100.0;

bool eventActive = false;
unsigned long lastEventTime = 0;
const unsigned long EVENT_COOLDOWN_MS = 1000;

// ------------------------------------------------------
// AWS IoT
// ------------------------------------------------------
WiFiClientSecure net;
MQTTClient client(1024);
String THINGNAME = "";

long sendInterval = 10000;
unsigned long lastShadowReport = 0;

// ------------------------------------------------------
// Swedish Plate Generator
// ------------------------------------------------------
String generateSwedishPlate() {
  String p = "";
  for (int i = 0; i < 3; i++) p += char('A' + random(0, 26));
  p += " ";
  int format = random(0, 2);

  if (format == 0) {
    for (int i = 0; i < 3; i++) p += String(random(0, 10));
  } else {
    p += String(random(0, 10));
    p += String(random(0, 10));
    p += char('A' + random(0, 26));
  }
  return p;
}

// ------------------------------------------------------
// Read Ultrasonic Sensor
// ------------------------------------------------------
float readDistance(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(5);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long d = pulseIn(echo, HIGH, 30000);
  if (d == 0) return 999;
  return d * 0.034 / 2.0;
}

// ------------------------------------------------------
// Publish Speed Telemetry
// ------------------------------------------------------
bool publishTelemetry(float speed) {
  JsonDocument doc;
  doc["name"] = "Nackademin";
  doc["from"] = "ESP32";
  doc["plate"] = generateSwedishPlate();
  doc["speed"] = (int)speed;
  doc["temperature"] = random(15, 30);
  doc["humidity"] = random(50, 90);

  String json;
  serializeJson(doc, json);

  Serial.println("Publishing: " + json);
  return client.publish(THINGNAME + "/telemetry", json);
}

// ------------------------------------------------------
// SHADOW: Apply settings from AWS
// ------------------------------------------------------
void updateSettings(JsonDocument obj) {
  Serial.println("Shadow update:");
  serializeJson(obj, Serial);
  Serial.println();

  if (obj.containsKey("sendIntervalSeconds")) {
    sendInterval = obj["sendIntervalSeconds"].as<int>() * 1000;
  }

  JsonDocument rep;
  rep["state"]["reported"] = obj;

  char buf[512];
  serializeJson(rep, buf);
  client.publish("$aws/things/" + THINGNAME + "/shadow/update", buf);
}

// ------------------------------------------------------
// SHADOW: Incoming Messages
// ------------------------------------------------------
void messageHandler(String &topic, String &payload) {
  JsonDocument doc;
  deserializeJson(doc, payload);

  if (topic.endsWith("shadow/get/accepted"))
    updateSettings(doc["state"]["desired"]);
  else if (topic.endsWith("shadow/update/delta"))
    updateSettings(doc["state"]);
}

// ------------------------------------------------------
// Connect to AWS IoT
// ------------------------------------------------------
void connectAWS() {

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  THINGNAME = WiFi.macAddress();
  THINGNAME.replace(":", "");

  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  client.begin(AWS_IOT_ENDPOINT, 8883, net);
  client.onMessage(messageHandler);

  while (!client.connect(THINGNAME.c_str())) {
    Serial.print(".");
    delay(200);
  }
  Serial.println("\nAWS connected!");

  client.subscribe(THINGNAME + "/downlink");
  client.subscribe("$aws/things/" + THINGNAME + "/shadow/get/accepted");
  client.subscribe("$aws/things/" + THINGNAME + "/shadow/update/delta");

  client.publish("$aws/things/" + THINGNAME + "/shadow/get");
}

// ------------------------------------------------------
// Send Shadow Heartbeat
// ------------------------------------------------------
void sendShadowHeartbeat() {
  JsonDocument doc;
  doc["state"]["reported"]["alive"] = true;
  doc["state"]["reported"]["timestamp"] = millis();

  char buf[256];
  serializeJson(doc, buf);

  client.publish("$aws/things/" + THINGNAME + "/shadow/update", buf);
  Serial.println("Shadow heartbeat sent");
}

// ------------------------------------------------------
// Setup
// ------------------------------------------------------
void setup() {
  Serial.begin(115200);

  pinMode(trig1, OUTPUT);  // Ultrasonic Trigger
  pinMode(echo1, INPUT_PULLDOWN); // SRF05 Echo needs pulldown
  pinMode(trig2, OUTPUT);
  pinMode(echo2, INPUT_PULLDOWN);

  connectAWS();
  Serial.println("System Ready.");
}

// ------------------------------------------------------
// LOOP — Speed Logic + Shadow
// ------------------------------------------------------
void loop() {

  unsigned long now = millis();

  // HEARTBEAT every 10 seconds
  if (now - lastShadowReport > 10000) {
    lastShadowReport = now;
    sendShadowHeartbeat();
  }

  // Cooldown mode
  if (eventActive) {
    if (now - lastEventTime < EVENT_COOLDOWN_MS) {
      client.loop();
      delay(10);
      return;
    }
    eventActive = false;
  }

  // SENSOR 1
  float d1 = readDistance(trig1, echo1);
  if (d1 < DETECT_CM) {

    Serial.println("Sensor 1 triggered");
    unsigned long t1 = now;

    // Wait until object leaves sensor 1
    while (readDistance(trig1, echo1) < DETECT_CM) {
      client.loop();
      delay(10);
    }

    // SENSOR 2
    bool triggered2 = false;
    unsigned long wait2 = millis();

    while (millis() - wait2 < 1000) {
      float d2 = readDistance(trig2, echo2);
      if (d2 < DETECT_CM) {
        Serial.println("Sensor 2 triggered");
        triggered2 = true;
        break;
      }
      client.loop();
      delay(10);
    }

    if (triggered2) {

      unsigned long t2 = millis();
      float dt = (t2 - t1) / 1000.0;

      // Wait until object leaves sensor 2
      while (readDistance(trig2, echo2) < DETECT_CM) {
        client.loop();
        delay(10);
      }

      if (dt > 0.01 && dt < 5.0) {

        float speed_mps = (SENSOR_DISTANCE_CM / 100.0) / dt;
        float speed_kmh = speed_mps * 3.6;

        if (speed_kmh > 180) {
          Serial.println("BAD DATA: too fast, ignored.");
        } else {
          Serial.print("Speed: ");
          Serial.println(speed_kmh);
          publishTelemetry(speed_kmh);
        }

        eventActive = true;
        lastEventTime = millis();
      }
    }
  }

  client.loop();
  delay(10);
}
