import React, { useState } from "react";

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
      <h1>To‑Do</h1>
      <div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New item"
        />
        <button onClick={add} style={{ marginLeft: 8 }}>
          Add
        </button>
      </div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
