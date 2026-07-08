import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Single shared pg Pool. Reused across hot reloads in dev to avoid exhausting
// Neon connections.
const globalForDb = globalThis as unknown as { pool?: Pool }

export const pool =
  globalForDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL })

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool

export const db = drizzle(pool, { schema })
