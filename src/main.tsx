import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./components/AdminPage";
import DevicePage from "./components/DevicePage";
// Bootstrap styles & JS for navbar/toggler
import "bootstrap/dist/css/bootstrap.min.css";
// App styles should come after Bootstrap to override defaults
import "./index.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Configure Amplify once using full outputs (Amplify Gen 2 schema)
Amplify.configure(outputs as any);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/devices" element={<DevicePage />} />
      <Route path="/devices/:id" element={<DevicePage />} />
      <Route
        path="/admin"
        element={
          <Authenticator
            initialState="signIn"
            loginMechanisms={["email"]}
            formFields={{
              signIn: {
                username: {
                  label: "Email",
                  type: "email",
                  placeholder: "you@example.com",
                  autocomplete: "email",
                },
              },
              signUp: {
                username: {
                  label: "Email",
                  type: "email",
                  placeholder: "you@example.com",
                  autocomplete: "email",
                },
                password: {
                  label: "Password",
                },
              },
            }}
          >
            <AdminPage />
          </Authenticator>
        }
      />
    </Routes>
  </BrowserRouter>
);

// Removed dark/light theme initialization
