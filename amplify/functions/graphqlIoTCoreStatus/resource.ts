import { defineFunction } from '@aws-amplify/backend';

export const graphqlIoTCoreStatus = defineFunction({
  name: 'graphqlIoTCoreStatus',
  entry: './handler.ts',
  resourceGroupName: 'data',
});
