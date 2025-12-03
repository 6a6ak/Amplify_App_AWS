# ESP32 device simulator (Docker)

This folder contains a small Docker-based simulator that behaves like an ESP32 device and connects to AWS IoT Core using certificate-based TLS (MQTT over TLS).

Files:

- `Dockerfile` — builds a small Python container running the simulator.
- `requirements.txt` — Python deps (`paho-mqtt`).
- `device.py` — simulator: connects to the provided AWS IoT endpoint with the certificate, publishes messages to a topic and listens for replies.

Usage (PowerShell / Windows):

1. Build the image from the repository root:

```powershell
docker build -t esp32-sim:latest .\esp32
```

2. Run the container, mounting a folder that contains your certificates (or the repo `Cert/` if you stored them there). The container expects three files under the mount path by default:

- `AmazonRootCA1.pem`
- `certificate.pem.crt`
- `private.pem.key`

Example run (PowerShell):

```powershell
docker run --rm -it \
  -e AWS_IOT_ENDPOINT="your-iot-endpoint.amazonaws.com" \
  -e CLIENT_ID="esp32-sim-1" \
  -e TOPIC="esp32/test" \
  -v ${env:USERPROFILE}\\.aws\\certs:/certs:ro \
  esp32-sim:latest
```

Notes:

- Replace `your-iot-endpoint.amazonaws.com` with your AWS IoT endpoint (from the AWS Console > IoT Core > Settings => `Custom endpoint`).
- If your cert files have different names, set environment variables `CA_PATH`, `CERT_PATH`, `KEY_PATH` to point to them inside the container (default path inside container is `/certs`).
- The simulator uses MQTT over TLS on port `8883` and will publish a message every 5 seconds.

Security:

- Keep certificate/private key files private. Do not commit them to git. This repo already ignores `Cert/` files.
