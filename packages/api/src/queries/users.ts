import { eq } from "drizzle-orm";
import { users } from "../../db/schema";

export async function getUserById(db: any, id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(db: any, email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}
