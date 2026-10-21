// Re-export the local shimbed client from `src/amplify/data/client.ts` so
// imports from `../amplify/data/client` resolve to a named `generateClient`.
import { generateClient } from "../../src/amplify/data/client";
import type { Schema } from "./resource";

export const client = generateClient<Schema>();
export { generateClient };
export type { Schema };
