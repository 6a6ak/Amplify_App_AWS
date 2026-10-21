import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { dataEnvironment } from '../shared/environment';
import type { Schema } from '../../data/resource';
import { ingestTelemetry, type IngestionClient } from '../shared/ingestion';

let clientPromise: Promise<IngestionClient> | undefined;
function getClient() {
  return clientPromise ??= (async () => {
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(dataEnvironment());
    Amplify.configure(resourceConfig, libraryOptions);
    return generateClient<Schema>({ authMode: 'iam' });
  })().catch(error => { clientPromise = undefined; throw error; });
}

export const handler = async (event: Record<string, unknown>) => {
  // Throw on failure so IoT/Lambda retry and dead-letter handling can run.
  return ingestTelemetry(event, await getClient());
};
