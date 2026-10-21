import type { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
type DataClientEnv = Parameters<typeof getAmplifyDataClientConfig>[0];

// Amplify grants inject these values into the Lambda environment. Validate at
// runtime so a missing grant fails closed without requiring generated imports.
export function dataEnvironment(env: NodeJS.ProcessEnv = process.env): DataClientEnv {
  for (const key of ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'AWS_REGION', 'AMPLIFY_DATA_DEFAULT_NAME']) {
    if (!env[key]) throw new Error(`Missing Lambda data configuration: ${key}`);
  }
  return env as DataClientEnv;
}
