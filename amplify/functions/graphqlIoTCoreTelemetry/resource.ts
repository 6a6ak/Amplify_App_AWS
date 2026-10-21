import { defineFunction } from '@aws-amplify/backend';

export const graphqlIoTCoreTelemetry = defineFunction({
  name: 'graphqlIoTCoreTelemetry',
  entry: './handler.ts',
  resourceGroupName: 'data',
});
