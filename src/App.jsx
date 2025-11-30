import React, { useState } from "react";
import Esp32Info from './components/Esp32Info';
import DeviceStatus from './components/DeviceStatus';
import SimpleStatus from './components/SimpleStatus';

export default function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  function add() {
    if (!text.trim()) return;
    setItems((prev) => [...prev, text.trim()]);
    setText("");
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>ESP32 Dashboard</h1>
      {/* Quick single-device view for easier debugging */}
      <SimpleStatus deviceId="ECE334B3BE68" />
      <DeviceStatus />
      <Esp32Info />
    </div>
  );
}
