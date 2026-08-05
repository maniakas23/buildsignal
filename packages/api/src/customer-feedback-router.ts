/**
 * Customer Feedback Router — BuildSignal v5.4.7
 * Captures customer feedback on recommendations and forwards approved
 * signals to Kestovar for learning.
 *
 * Feedback types: helpful, not_helpful, saved_opportunity, dismissed_opportunity,
 * incorrect_data, evidence_dispute, action_taken, outcome_observed
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { sendFeedback } from "./lib/kestovar";

const FEEDBACK_TYPES = [
  "helpful",
  "not_helpful",
  "saved_opportunity",
  "dismissed_opportunity",
  "incorrect_data",
  "evidence_dispute",
  "action_taken",
  "outcome_observed",
] as const;

export const customerFeedbackRouter = createRouter({
  // ─── Submit feedback on a recommendation ───
  submit: authedQuery
    .input(z.object({
      recommendationId: z.number(),
      feedbackType: z.enum(FEEDBACK_TYPES),
      comment: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const orgId = ctx.user?.orgId;
      if (!userId || !orgId) return { success: false, error: "Not authenticated" };

      // Store the feedback in D1
      const result = await db.insert(schema.customerFeedback).values({
        recommendationId: input.recommendationId,
        organizationId: orgId,
        userId,
        feedbackType: input.feedbackType,
        comment: input.comment,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      }).returning();

      const stored = result[0];
      if (!stored) return { success: false, error: "Failed to store feedback" };

      // Forward to Kestovar if the client is available
      let forwarded = false;
      try {
        if (ctx.kestovar) {
          await sendFeedback(ctx.kestovar, {
            feedbackId: String(stored.id),
            recommendationId: String(input.recommendationId),
            organizationId: orgId,
            userId,
            feedbackType: input.feedbackType,
            comment: input.comment,
            metadata: input.metadata,
            submittedAt: new Date().toISOString(),
          });

          // Mark as forwarded
          await db.update(schema.customerFeedback)
            .set({ forwardedToKestovar: true, forwardedAt: new Date() })
            .where(eq(schema.customerFeedback.id, stored.id));
          forwarded = true;
        }
      } catch {
        // Kestovar forwarding failed — feedback is still stored locally.
        // A background queue processor will retry later.
        forwarded = false;
      }

      return { success: true, feedbackId: stored.id, forwardedToKestovar: forwarded };
    }),

  // ─── List feedback for an organization (admin) ───
  list: authedQuery
    .input(z.object({
      recommendationId: z.number().optional(),
      feedbackType: z.string().optional(),
      forwarded: z.boolean().optional(),
      limit: z.number().min(1).max(200).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId) return { feedback: [], total: 0 };

      const conditions = [eq(schema.customerFeedback.organizationId, orgId)];
      if (input?.recommendationId) conditions.push(eq(schema.customerFeedback.recommendationId, input.recommendationId));
      if (input?.feedbackType) conditions.push(eq(schema.customerFeedback.feedbackType, input.feedbackType));
      if (input?.forwarded !== undefined) {
        conditions.push(eq(schema.customerFeedback.forwardedToKestovar, input.forwarded));
      }

      const rows = await db.select().from(schema.customerFeedback)
        .where(and(...conditions))
        .orderBy(desc(schema.customerFeedback.createdAt))
        .limit(input?.limit || 50);

      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(schema.customerFeedback)
        .where(eq(schema.customerFeedback.organizationId, orgId));

      return {
        feedback: rows.map((r: (typeof rows)[0]) => ({
          ...r,
          metadata: r.metadata ? JSON.parse(r.metadata) : null,
        })),
        total: totalResult[0]?.count ?? 0,
      };
    }),

  // ─── Distribution of feedback by type ───
  distribution: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const orgId = ctx.user?.orgId;
    if (!orgId) return { distribution: [] };

    const rows = await db.select({
      feedbackType: schema.customerFeedback.feedbackType,
      count: sql<number>`count(*)`,
    })
      .from(schema.customerFeedback)
      .where(eq(schema.customerFeedback.organizationId, orgId))
      .groupBy(schema.customerFeedback.feedbackType);

    return {
      distribution: rows.map((r: (typeof rows)[0]) => ({
        type: r.feedbackType,
        count: r.count,
      })),
    };
  }),
});
