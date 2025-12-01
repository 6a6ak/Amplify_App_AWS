import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "../amplify/data/client";
import outputs from "../amplify_outputs.json";

import {
  Badge,
  Button,
  Card,
  Collection,
  Divider,
  Flex,
  Heading,
  useAuthenticator,
  View,
  Text
} from '@aws-amplify/ui-react';

import ErrorBoundary from './ErrorBoundary';

const client = generateClient<Schema>();

function App() {

  // Determine whether Auth is configured (matches logic in `main.tsx`).
  const hasAuthConfigured = !!(
    outputs && outputs.auth && typeof outputs.auth.user_pool_id === 'string' &&
    !outputs.auth.user_pool_id.includes('PLACEHOLDER')
  );

  // Quick runtime telemetry to help debugging blank pages in production.
  // This will appear in the browser console when the app mounts.
  console.log('App initializing', { hasAuthConfigured, VITE_DATA_API_URL: (import.meta as any).env?.VITE_DATA_API_URL });

  let user: any = undefined;
  let signOut = () => {};
  if (hasAuthConfigured) {
    const auth = useAuthenticator();
    user = auth.user;
    signOut = auth.signOut;
  } else {
    // Provide a minimal guest user so UI can render without Authenticator.
    user = { signInDetails: { loginId: 'public' }, userId: 'public' };
    signOut = () => { /* noop for guest */ };
  }

  const [devices, setDevices] = useState<Array<Schema["Devices"]["type"]>>([]);
  useEffect(() => {
    client.models.Devices.observeQuery().subscribe({
      next: (data) => { setDevices([...data.items]) },
    });
  }, []);

  function createDevice() {
    const device = String(window.prompt("Device ID"));
    client.models.Devices.create({ device_id: device, owner: user.userId })
  }

  function deleteDevice(device_id: string) {
    client.models.Devices.delete({ device_id })
  }


  return (
    <ErrorBoundary>
    <main>
      <h1>{user?.signInDetails?.loginId}'s Devices</h1>
      <Divider padding="xs" />
      <h3>Devices</h3>
      {
        <Button
          variation="primary"
          loadingText=""
          onClick={createDevice}
        >
          Add Device
        </Button>
      }

      <Divider padding="xs" />

      <Collection
        items={devices}
        type="list"
        direction="row"
        gap="20px"
        wrap="nowrap"
      >
        {(item, index) => (
          <Card
            key={index}
            borderRadius="medium"
            maxWidth="20rem"
            variation="outlined"
          >

            <View padding="xs">
              <Flex>
                {/* Last Seen: {telemetries[telemetries.length - 1]?.timestamp ? moment(telemetries[telemetries.length - 1].timestamp).fromNow() : ""} */}

              </Flex>

              <br />
              <Flex>
                Status:
                <Badge variation={(item?.status == "connected") ? "success" : "error"} key={item.device_id}>
                  {item?.status ? item?.status.charAt(0).toUpperCase() + String(item?.status).slice(1) : ""}
                </Badge>
              </Flex>
              <br />
              <Flex>ID: {item.device_id}</Flex>
              <br />
              <Button variation="destructive" isFullWidth onClick={() => deleteDevice(item.device_id)}>
                Delete
              </Button>
            </View>
          </Card>
        )}
      </Collection>
      <View padding="xs"></View>
      <button onClick={signOut}>Sign out</button>
    </main>
    </ErrorBoundary>
  );
}

export default App;
