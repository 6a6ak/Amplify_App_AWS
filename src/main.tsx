import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./components/AdminPage";

// Configure Amplify once using full outputs (Amplify Gen 2 schema)
Amplify.configure(outputs as any);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Authenticator initialState="signIn" loginMechanisms={["email"]}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </Authenticator>
);

