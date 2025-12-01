import { generateClient } from "aws-amplify/data";
import type { Schema } from "./resource";

export const client = generateClient<Schema>();