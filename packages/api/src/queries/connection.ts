import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";

export function createConnection(db: D1Database) {
  return drizzle(db, { schema });
}
