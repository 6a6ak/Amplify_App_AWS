// Re-export the local shimbed client from `src/amplify/data/client.ts` so
// imports from `../amplify/data/client` resolve to a named `generateClient`.
export { generateClient } from "../../src/amplify/data/client";
export type { Schema } from "./resource";

export const client = generateClient<Schema>();