import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:../../sqlite.db"; // Relative to src inside workspace
}

export const client = createClient({ url: process.env.DATABASE_URL });
export const db = drizzle(client, { schema });

export * from "./schema";
