import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';
import { graphqlIoTCoreTelemetry } from '../functions/graphqlIoTCoreTelemetry/resource';
import { graphqlIoTCoreStatus } from '../functions/graphqlIoTCoreStatus/resource';

const iotCoreHandler = defineFunction({ entry: './iot-core-handler/handler.ts' });

// Browser users can access only their records. IoT ingestion uses Lambda IAM
// roles, never a public API key shipped to the browser.
const schema = a.schema({
  Devices: a.model({
    device_id: a.string().required(),
    owner: a.string().required(),
    status: a.string(),
  }).identifier(['device_id']).authorization(allow => [allow.owner().to(['read']), allow.group('admin')]),
  Telemetry: a.model({
    device_id: a.string().required(),
    timestamp: a.timestamp().required(),
    temperature: a.float(),
    humidity: a.float(),
    owner: a.string().required(),
  }).identifier(['device_id', 'timestamp']).authorization(allow => [allow.owner().to(['read']), allow.group('admin')]),
  AddTelemetry: a.mutation().arguments({
    device_id: a.string().required(),
    timestamp: a.timestamp().required(),
    temperature: a.float(),
    humidity: a.float(),
    owner: a.string().required(),
  }).returns(a.ref('Telemetry'))
    .authorization(allow => [allow.group('admin')])
    .handler(a.handler.function(iotCoreHandler)),
}).authorization(allow => [
  allow.resource(graphqlIoTCoreTelemetry).to(['query', 'mutate']),
  allow.resource(graphqlIoTCoreStatus).to(['mutate']),
]);

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema, authorizationModes: { defaultAuthorizationMode: 'userPool' } });
