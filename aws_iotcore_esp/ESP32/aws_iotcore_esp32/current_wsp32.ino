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
const float SENSOR_DISTANCE_CM = 100.0; // Real distance between sensors (cm)
const unsigned long MAX_TIME_MS = 3000; // Max 3 seconds allowed between sensors

// ------------------------------------------------------
// AWS IoT
// ------------------------------------------------------
WiFiClientSecure net;
MQTTClient client(1024);
String THINGNAME = "";

// ------------------------------------------------------
// State Machine
// ------------------------------------------------------
enum State { IDLE, WAIT_LEAVE_1, WAIT_SENSOR2, WAIT_LEAVE_2 };
State state = IDLE;

unsigned long t1 = 0;
unsigned long lastShadow = 0;

// ------------------------------------------------------
// Distance Filter
// ------------------------------------------------------
float readDistance(int trig, int echo) {
  float avg = 0;
  for (int i = 0; i < 3; i++) {
    digitalWrite(trig, LOW);
    delayMicroseconds(5);
    digitalWrite(trig, HIGH);
    delayMicroseconds(10);
    digitalWrite(trig, LOW);

    long dur = pulseIn(echo, HIGH, 30000);
    float cm = dur == 0 ? 999 : dur * 0.034 / 2.0;
    avg += cm;
    delayMicroseconds(1000);
  }
  return avg / 3.0;
}

// ------------------------------------------------------
// Publish Telemetry
// ------------------------------------------------------
String generatePlate() {
  String p = "";
  for (int i = 0; i < 3; i++) p += char('A' + random(26));
  p += " ";
  for (int i = 0; i < 3; i++) p += String(random(10));
  return p;
}

void publishSpeed(float speed) {
  DynamicJsonDocument doc(256);
  doc["name"] = "Nackademin";
  doc["from"] = "ESP32";
  doc["plate"] = generatePlate();
  doc["speed"] = (int)speed;
 doc["temperature"] = random(15, 30);  
  doc["humidity"] = random(50, 90);    
  String json;
  serializeJson(doc, json);

  Serial.println("Publishing: " + json);
  client.publish(THINGNAME + "/telemetry", json);
}

// ------------------------------------------------------
// AWS Shadow Heartbeat
// ------------------------------------------------------
void sendShadow() {
  DynamicJsonDocument doc(200);
  doc["state"]["reported"]["alive"] = true;
  doc["state"]["reported"]["ts"] = millis();

  String json;
  serializeJson(doc, json);
  client.publish("$aws/things/" + THINGNAME + "/shadow/update", json);
}

// ------------------------------------------------------
// AWS Connect
// ------------------------------------------------------
void connectAWS() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(100);
  Serial.println("WiFi connected");

  THINGNAME = WiFi.macAddress();
  THINGNAME.replace(":", "");

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  client.begin(AWS_IOT_ENDPOINT, 8883, net);
  while (!client.connect(THINGNAME.c_str())) delay(100);
  Serial.println("AWS connected!");
}

// ------------------------------------------------------
// Setup
// ------------------------------------------------------
void setup() {
  Serial.begin(115200);

  pinMode(trig1, OUTPUT);
  pinMode(echo1, INPUT_PULLDOWN);
  pinMode(trig2, OUTPUT);
  pinMode(echo2, INPUT_PULLDOWN);

  connectAWS();
  Serial.println("READY");
}

// ------------------------------------------------------
// Main Loop — State Machine
// ------------------------------------------------------
void loop() {
  client.loop();
  unsigned long now = millis();

  if (now - lastShadow > 10000) {
    lastShadow = now;
    sendShadow();
  }

  float d1 = readDistance(trig1, echo1);
  float d2 = readDistance(trig2, echo2);

  switch (state) {

    case IDLE:
      if (d1 < DETECT_CM) {
        Serial.println("S1 detected → start");
        t1 = now;
        state = WAIT_LEAVE_1;
      }
      break;

    case WAIT_LEAVE_1:
      if (d1 >= DETECT_CM) {
        Serial.println("Object left S1 → wait S2");
        state = WAIT_SENSOR2;
      }
      break;

    case WAIT_SENSOR2:
      if (d2 < DETECT_CM) {
        Serial.println("S2 detected → measuring speed");
        state = WAIT_LEAVE_2;
      }
      if (now - t1 > MAX_TIME_MS) {
        Serial.println("Timeout → reset");
        state = IDLE;
      }
      break;

    case WAIT_LEAVE_2:
      if (d2 >= DETECT_CM) {
        unsigned long t2 = now;
        float dt = (t2 - t1) / 1000.0;
        float speed = (SENSOR_DISTANCE_CM / 100.0) / dt * 3.6;

        if (speed > 5 && speed < 200) {
          Serial.printf("Speed = %.2f km/h\n", speed);
          publishSpeed(speed);
        } else {
          Serial.println("BAD SPEED IGNORED");
        }
        state = IDLE;
      }
      break;
  }
}
