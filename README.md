



# 🚗 Car Speed Logging System


## 📋 Table of Contents

| [Overview](#overview) | [Hardware](#hardware) | [AWS Architecture](#aws-architecture) |
|:---------------------:|:--------------------:|:----------------------------:|
| [Web Application](#web-application) | [Security](#security) | [Monitoring & Logging](#monitoring-and-logging) |
| [Data Flow](#data-flow) | [Getting Started](#getting-started) | [License](#license) |


## Overview

A secure IoT system for monitoring car speeds on a street using ESP32/ESP8266 devices and AWS cloud services. The system detects vehicle movement using ultrasonic sensors, calculates speed, generates sample plate numbers, and logs data for analysis.


## Hardware

| ![Ultrasonic Sensors](https://img.icons8.com/ios-filled/24/ultrasonic.png) **Ultrasonic Sensors** | ![ESP32](https://img.icons8.com/ios-filled/24/microchip.png) **ESP32 / ESP8266** |
|:------------------------------------------------------:|:---------------------------------------------:|
| Detect vehicle movement between two fixed points. | Calculates speed, generates plate IDs, and publishes MQTT messages. |


## AWS Architecture

| ![IoT Core](https://img.icons8.com/ios-filled/24/cloud.png) **AWS IoT Core** | ![Lambda](https://img.icons8.com/ios-filled/24/lambda.png) **Lambda** |
|:---------------------------------------------:|:---------------------------------------------:|
| Secure MQTT messaging channel <br> **Topics:** `telemetry`, `status`, `deadlink` | Processes messages and triggers storage actions |

| ![DynamoDB](https://img.icons8.com/ios-filled/24/database.png) **DynamoDB** | ![S3](https://img.icons8.com/ios-filled/24/archive.png) **S3 Bucket** |
|:---------------------------------------------:|:---------------------------------------------:|
| Stores JSON-based speed and plate data | Stores raw data for archival and analysis |

| ![API Gateway](https://img.icons8.com/ios-filled/24/pluggable.png) **API Gateway** | ![Cognito](https://img.icons8.com/ios-filled/24/user-shield.png) **Cognito** |
|:---------------------------------------------:|:---------------------------------------------:|
| Provides REST interface for frontend access | Authentication for admin dashboard usage |

| ![IAM](https://img.icons8.com/ios-filled/24/id-verified.png) **IAM** | ![CloudWatch](https://img.icons8.com/ios-filled/24/combo-chart.png) **CloudWatch** |
|:---------------------------------------------:|:---------------------------------------------:|
| Role-based access control for all resources | Logs, metrics, alarms |

| ![CloudTrail](https://img.icons8.com/ios-filled/24/track-order.png) **CloudTrail & AWS Config** |
|:---------------------------------------------:|
| Compliance and configuration tracking |



## Web Application

<img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React Logo" width="32" height="32" />

Built with React. Modern, responsive frontend for administrators to view logs and system insights.

**AWS Amplify Deployment:** Managed deployment and hosting. Automatic updates on `release` branch push.


## Security

| 🔒 **Encrypted Connections** | 🛡️ **IAM & Cognito** | 🚦 **Controlled Access** |
|:---------------------------:|:-------------------:|:----------------------:|
| MQTT secured with device certificates. | Strict IAM roles and Cognito authentication for admin tools. | Limited database and storage permissions. |


## Monitoring & Logging

| 📊 **CloudWatch** | 📋 **CloudTrail** | ⚙️ **AWS Config** |
|:----------------:|:----------------:|:----------------:|
| Logs and real-time metrics. | Auditing changes and API activity. | Configuration compliance tracking. |


## Data Flow

| 🚗 **Detection & Speed Calculation** | 📡 **MQTT Telemetry** |
|:-----------------------------------:|:--------------------:|
| Sensor detects a vehicle and calculates speed. | Telemetry is sent over MQTT to AWS IoT Core. |

| 🌀 **Lambda Processing** | 💾 **Data Storage** |
|:----------------------:|:------------------:|
| IoT Core triggers Lambda for processing. | Data stored in DynamoDB and backed up in S3. |

| 🖥️ **Admin UI Access** | ✅ **Access Validation** |
|:---------------------:|:-------------------:|
| Admin UI retrieves data via API Gateway. | Cognito validates access permissions. |


## Getting Started

1. Clone the repository
2. Create AWS IoT Core resources and download certificates
3. Set up DynamoDB, Lambda, S3, API Gateway, Cognito, and CloudWatch
4. Flash firmware code to ESP32/ESP8266 boards
5. Configure WiFi and MQTT certificates on the devices
6. Deploy the web interface with Amplify and connect to GitHub

# Car Speed Logging System

---

## Table of Contents

| [Overview](#overview) | [Hardware](#hardware) | [AWS Architecture](#aws-architecture) |
|:---------------------:|:--------------------:|:----------------------------:|
| [Web Application](#web-application) | [Security](#security) | [Monitoring & Logging](#monitoring--logging) |
| [Data Flow](#data-flow) | [Getting Started](#getting-started) | [License](#license) |

---

## Overview

A secure IoT system for monitoring car speeds on a street using ESP32/ESP8266 devices and AWS cloud services. The system detects vehicle movement using ultrasonic sensors, calculates speed, generates sample plate numbers, and logs data for analysis.

---

## Hardware

| <b>Ultrasonic Sensors</b><br><sub>Detect vehicle movement between two fixed points.</sub> | <b>ESP32 / ESP8266</b><br><sub>Calculates speed, generates plate IDs, and publishes MQTT messages.</sub> |
|:------------------------------------------------------:|:---------------------------------------------:|

---

## AWS Architecture

| <b>AWS IoT Core</b><br><sub>Secure MQTT messaging channel</sub><br><sub>Topics: <code>telemetry</code>, <code>status</code>, <code>deadlink</code></sub> | <b>Lambda</b><br><sub>Processes messages and triggers storage actions</sub> |
|:---------------------------------------------:|:---------------------------------------------:|

| <b>DynamoDB</b><br><sub>Stores JSON-based speed and plate data</sub> | <b>S3 Bucket</b><br><sub>Stores raw data for archival and analysis</sub> |
|:---------------------------------------------:|:---------------------------------------------:|

| <b>API Gateway</b><br><sub>Provides REST interface for frontend access</sub> | <b>Cognito</b><br><sub>Authentication for admin dashboard usage</sub> |
|:---------------------------------------------:|:---------------------------------------------:|

| <b>IAM</b><br><sub>Role-based access control for all resources</sub> | <b>CloudWatch</b><br><sub>Logs, metrics, alarms</sub> |
|:---------------------------------------------:|:---------------------------------------------:|

| <b>CloudTrail & AWS Config</b><br><sub>Compliance and configuration tracking</sub> |
|:---------------------------------------------:|

---

## Web Application

<img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React Logo" width="24" height="24" />

Built with React. Modern, responsive frontend for administrators to view logs and system insights.

**AWS Amplify Deployment:** Managed deployment and hosting. Automatic updates on `release` branch push.

---

## Security

| <b>Encrypted Connections</b><br><sub>MQTT secured with device certificates.</sub> | <b>IAM & Cognito</b><br><sub>Strict IAM roles and Cognito authentication for admin tools.</sub> | <b>Controlled Access</b><br><sub>Limited database and storage permissions.</sub> |
|:---------------------------:|:-------------------:|:----------------------:|

---

## Monitoring & Logging

| <b>CloudWatch</b><br><sub>Logs and real-time metrics.</sub> | <b>CloudTrail</b><br><sub>Auditing changes and API activity.</sub> | <b>AWS Config</b><br><sub>Configuration compliance tracking.</sub> |
|:----------------:|:----------------:|:----------------:|

---

## Data Flow

| <b>Detection & Speed Calculation</b><br><sub>Sensor detects a vehicle and calculates speed.</sub> | <b>MQTT Telemetry</b><br><sub>Telemetry is sent over MQTT to AWS IoT Core.</sub> |
|:-----------------------------------:|:--------------------:|

| <b>Lambda Processing</b><br><sub>IoT Core triggers Lambda for processing.</sub> | <b>Data Storage</b><br><sub>Data stored in DynamoDB and backed up in S3.</sub> |
|:----------------------:|:------------------:|

| <b>Admin UI Access</b><br><sub>Admin UI retrieves data via API Gateway.</sub> | <b>Access Validation</b><br><sub>Cognito validates access permissions.</sub> |
|:---------------------:|:-------------------:|

---

## Getting Started

1. Clone the repository
2. Create AWS IoT Core resources and download certificates
3. Set up DynamoDB, Lambda, S3, API Gateway, Cognito, and CloudWatch
4. Flash firmware code to ESP32/ESP8266 boards
5. Configure WiFi and MQTT certificates on the devices
6. Deploy the web interface with Amplify and connect to GitHub

---

## License
MIT License. See LICENSE file for details.
|-------------------------|------------------------|-----------------------------|
| [💻 Web Application](#web-application) | [🔒 Security](#security) | [📊 Monitoring & Logging](#monitoring-and-logging) |
| [🔀 Data Flow](#data-flow) | [🚀 Getting Started](#getting-started) | [⚖️ License](#license) |

</div>

---

## 🔎 Overview

A secure IoT system for monitoring car speeds on a street using ESP32/ESP8266 devices and AWS cloud services. The system detects vehicle movement using ultrasonic sensors, calculates speed, generates sample plate numbers, and logs data for analysis.

---

## 🔧 Hardware

**Ultrasonic Sensors**
> Detect vehicle movement between two fixed points.

**ESP32 / ESP8266**
> Calculates speed, generates plate IDs, and publishes MQTT messages.

---

## ☁️ AWS Architecture

**AWS IoT Core**
> Secure MQTT messaging channel

**Topics used:**
`telemetry`, `status`, `deadlink`

**Lambda**
> Processes messages and triggers storage actions

**DynamoDB**
> Stores JSON-based speed and plate data

**S3 Bucket**
> Stores raw data for archival and analysis

**API Gateway**
> Provides REST interface for frontend access

**Cognito**
> Authentication for admin dashboard usage

**IAM**
> Role-based access control for all resources

**CloudWatch**
> Logs, metrics, alarms

**CloudTrail & AWS Config**
> Compliance and configuration tracking

---

## 💻 Web Application

![React Logo](https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg)

Built with React

Modern, responsive frontend for administrators to view logs and system insights.

**AWS Amplify Deployment**
> Managed deployment and hosting. Automatic updates on `release` branch push.

---

## 🔒 Security

**Encrypted Connections**
> MQTT secured with device certificates.

**IAM & Cognito**
> Strict IAM roles and Cognito authentication for admin tools.

**Controlled Access**
> Limited database and storage permissions.

---

## 📊 Monitoring and Logging

**CloudWatch**
> Logs and real-time metrics.

**CloudTrail**
> Auditing changes and API activity.

**AWS Config**
> Configuration compliance tracking.

---

## 🔀 Data Flow

**Detection & Speed Calculation**
> Sensor detects a vehicle and calculates speed.

**MQTT Telemetry**
> Telemetry is sent over MQTT to AWS IoT Core.

**Lambda Processing**
> IoT Core triggers Lambda for processing.

**Data Storage**
> Data stored in DynamoDB and backed up in S3.

**Admin UI Access**
> Admin UI retrieves data via API Gateway.

**Access Validation**
> Cognito validates access permissions.

---

## 🚀 Getting Started

1. Clone the repository
2. Create AWS IoT Core resources and download certificates
3. Set up DynamoDB, Lambda, S3, API Gateway, Cognito, and CloudWatch
4. Flash firmware code to ESP32/ESP8266 boards
5. Configure WiFi and MQTT certificates on the devices
6. Deploy the web interface with Amplify and connect to GitHub

---

## ⚖️ License
MIT License. See LICENSE file for details.
