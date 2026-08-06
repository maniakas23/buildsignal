/**
 * Webhook Router — Sprint 4
 * Webhook subscription management with HMAC signature verification
 */

import { createRouter, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { webhookSubscriptions, webhookDeliveries } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

const subscriptionSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().default(true),
});

export const webhookRouter = createRouter({
  // ─── List subscriptions ───
  list: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;
    const orgId = ctx.user.orgId ?? null;

    const subs = await db
      .select()
      .from(webhookSubscriptions)
      .where(and(eq(webhookSubscriptions.userId, userId), eq(webhookSubscriptions.orgId, orgId)))
      .orderBy(desc(webhookSubscriptions.createdAt));

    return subs.map((s) => ({
      ...s,
      events: JSON.parse(s.events),
    }));
  }),

  // ─── Create subscription ───
  create: protectedQuery
    .input(subscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const orgId = ctx.user.orgId ?? null;

      const [sub] = await db
        .insert(webhookSubscriptions)
        .values({
          userId,
          orgId,
          url: input.url,
          events: JSON.stringify(input.events),
          secret: input.secret ?? null,
          description: input.description ?? null,
          active: input.active,
        })
        .returning();

      return {
        ...sub,
        events: JSON.parse(sub.events),
      };
    }),

  // ─── Update subscription ───
  update: protectedQuery
    .input(z.object({
      id: z.number(),
      ...subscriptionSchema.partial().shape,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const orgId = ctx.user.orgId ?? null;
      const { id, ...updates } = input;

      const values: any = { updatedAt: new Date() };
      if (updates.url) values.url = updates.url;
      if (updates.events) values.events = JSON.stringify(updates.events);
      if (updates.secret !== undefined) values.secret = updates.secret;
      if (updates.description !== undefined) values.description = updates.description;
      if (updates.active !== undefined) values.active = updates.active;

      const [sub] = await db
        .update(webhookSubscriptions)
        .set(values)
        .where(and(
          eq(webhookSubscriptions.id, id),
          eq(webhookSubscriptions.userId, userId),
          eq(webhookSubscriptions.orgId, orgId)
        ))
        .returning();

      if (!sub) throw new Error("Subscription not found");

      return {
        ...sub,
        events: JSON.parse(sub.events),
      };
    }),

  // ─── Delete subscription ───
  delete: protectedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const orgId = ctx.user.orgId ?? null;

      await db
        .delete(webhookSubscriptions)
        .where(and(
          eq(webhookSubscriptions.id, input.id),
          eq(webhookSubscriptions.userId, userId),
          eq(webhookSubscriptions.orgId, orgId)
        ));

      return { success: true };
    }),

  // ─── List delivery logs ───
  deliveries: protectedQuery
    .input(z.object({ subscriptionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const orgId = ctx.user.orgId ?? null;

      // Verify subscription ownership
      const [sub] = await db
        .select()
        .from(webhookSubscriptions)
        .where(and(
          eq(webhookSubscriptions.id, input.subscriptionId),
          eq(webhookSubscriptions.userId, userId),
          eq(webhookSubscriptions.orgId, orgId)
        ))
        .limit(1);

      if (!sub) throw new Error("Subscription not found");

      const deliveries = await db
        .select()
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.subscriptionId, input.subscriptionId))
        .orderBy(desc(webhookDeliveries.createdAt))
        .limit(50);

      return deliveries;
    }),

  // ─── Test webhook (send test payload) ───
  test: protectedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const orgId = ctx.user.orgId ?? null;

      const [sub] = await db
        .select()
        .from(webhookSubscriptions)
        .where(and(
          eq(webhookSubscriptions.id, input.id),
          eq(webhookSubscriptions.userId, userId),
          eq(webhookSubscriptions.orgId, orgId)
        ))
        .limit(1);

      if (!sub) throw new Error("Subscription not found");

      // Send test payload
      const testPayload = {
        event: "test.webhook",
        timestamp: new Date().toISOString(),
        data: { message: "This is a test webhook from BuildSignal" },
      };

      try {
        const response = await fetch(sub.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-BuildSignal-Event": "test.webhook",
            "X-BuildSignal-Signature": sub.secret
              ? await generateHmacSignature(JSON.stringify(testPayload), sub.secret)
              : "",
          },
          body: JSON.stringify(testPayload),
        });

        // Log delivery
        await db.insert(webhookDeliveries).values({
          subscriptionId: sub.id,
          eventType: "test.webhook",
          payload: JSON.stringify(testPayload),
          responseStatus: response.status,
          responseBody: await response.text().catch(() => ""),
          success: response.ok,
          durationMs: 0,
        });

        return { success: response.ok, status: response.status };
      } catch (e) {
        // Log failed delivery
        await db.insert(webhookDeliveries).values({
          subscriptionId: sub.id,
          eventType: "test.webhook",
          payload: JSON.stringify(testPayload),
          responseStatus: 0,
          responseBody: e instanceof Error ? e.message : "Network error",
          success: false,
          durationMs: 0,
        });

        return { success: false, error: e instanceof Error ? e.message : "Network error" };
      }
    }),
});

async function generateHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export type WebhookRouter = typeof webhookRouter;
