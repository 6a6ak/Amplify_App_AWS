# ESP32 info server

Small server to expose parsed information from `aws_iotcore_esp32/aws_iotcore_esp32.ino`.

Run:

```powershell
cd server
npm install
npm start
```

Then open `http://localhost:3333/api/esp32/info` to see parsed JSON and first 300 lines of the sketch.
