import React, { useState } from "react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  function addTodo(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setTodos([{ id: Date.now(), text: t, done: false }, ...todos]);
    setText("");
  }

  function toggle(id) {
    setTodos(
      todos.map((td) => (td.id === id ? { ...td, done: !td.done } : td))
    );
  }

  function remove(id) {
    setTodos(todos.filter((td) => td.id !== id));
  }

  return (
    <div className="app">
      <h1>To‑Do (Amplify Starter)</h1>
      <form onSubmit={addTodo} className="todo-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task..."
        />
        <button type="submit">Add</button>
      </form>

      <ul className="todo-list">
        {todos.map((td) => (
          <li key={td.id} className={td.done ? "done" : ""}>
            <label>
              <input
                type="checkbox"
                checked={td.done}
                onChange={() => toggle(td.id)}
              />
              <span>{td.text}</span>
            </label>
            <button className="remove" onClick={() => remove(td.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p className="hint">
        This is a minimal Vite + React To‑Do starter for Amplify.
      </p>
    </div>
  );
}
