import { eq } from "drizzle-orm";
import { getDb, getSchema, isD1 } from "./connection";
import { env } from "../lib/env";
import * as schema from "@db/schema";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: any) {
  const values = { ...data };
  const updateSet: any = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (isD1()) {
    // SQLite: use onConflictDoUpdate
    await getDb()
      .insert(schema.users)
      .values(values)
      .onConflictDoUpdate({
        target: schema.users.unionId,
        set: updateSet,
      });
  } else {
    // MySQL: use onDuplicateKeyUpdate
    await getDb()
      .insert(schema.users)
      .values(values)
      .onDuplicateKeyUpdate({ set: updateSet });
  }
}

export async function getUserById(userId: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return rows.at(0);
}

export async function updateUserPlan(userId: number, plan: string) {
  await getDb()
    .update(schema.users)
    .set({ plan })
    .where(eq(schema.users.id, userId));
}
