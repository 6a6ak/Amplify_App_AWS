import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "./amplify-auth.json";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./components/AdminPage";
import DevicePage from "./components/DevicePage";
import AboutPage from "./components/AboutPage";
// Bootstrap styles & JS for navbar/toggler
import "bootstrap/dist/css/bootstrap.min.css";
// App styles should come after Bootstrap to override defaults
import "./index.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Public Cognito identifiers only; never bundle generated data API keys.
Amplify.configure(outputs as any);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />

      <Route path="/about" element={<AboutPage />} />
      <Route path="/devices" element={<DevicePage />} />
      <Route path="/devices/:id" element={<DevicePage />} />
      <Route
        path="/admin"
        element={
          <div className="auth-wrapper">
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
          </div>
        }
      />
    </Routes>
  </BrowserRouter>
);

// Removed dark/light theme initialization
