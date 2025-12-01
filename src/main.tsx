import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);
// If `amplify_outputs.json` contains placeholder values (used for CI or
// when Auth isn't setup), skip the Authenticator so the dashboard is
// publicly visible. This avoids a blank page when Cognito isn't configured.
const hasAuthConfigured = !!(
  outputs && outputs.auth && typeof outputs.auth.user_pool_id === 'string' &&
  !outputs.auth.user_pool_id.includes('PLACEHOLDER')
);

const Root = () => (
  <React.StrictMode>
    {hasAuthConfigured ? (
      <Authenticator>
        <App />
      </Authenticator>
    ) : (
      <App />
    )}
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
 