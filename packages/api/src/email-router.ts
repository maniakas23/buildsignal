/**
 * Email Router — Sprint 4
 * Email notifications, digests, and preferences
 */

import { createRouter, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { emailPreferences, emailQueue } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const emailPreferencesSchema = z.object({
  email: z.string().email(),
  dailyDigest: z.boolean().default(true),
  weeklyReport: z.boolean().default(true),
  newOpportunities: z.boolean().default(true),
  alertMatches: z.boolean().default(true),
  systemUpdates: z.boolean().default(false),
  marketing: z.boolean().default(false),
});

export const emailRouter = createRouter({
  // ─── Get email preferences ───
  getPreferences: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;

    const [prefs] = await db
      .select()
      .from(emailPreferences)
      .where(eq(emailPreferences.userId, userId))
      .limit(1);

    return prefs ?? {
      userId,
      email: ctx.user.email ?? "",
      dailyDigest: true,
      weeklyReport: true,
      newOpportunities: true,
      alertMatches: true,
      systemUpdates: false,
      marketing: false,
    };
  }),

  // ─── Update email preferences ───
  updatePreferences: protectedQuery
    .input(emailPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(emailPreferences)
        .where(eq(emailPreferences.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        const [updated] = await db
          .update(emailPreferences)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(emailPreferences.userId, userId))
          .returning();
        return updated;
      } else {
        const [created] = await db
          .insert(emailPreferences)
          .values({
            userId,
            ...input,
          })
          .returning();
        return created;
      }
    }),

  // ─── Queue an email ───
  queue: protectedQuery
    .input(z.object({
      to: z.string().email(),
      subject: z.string().min(1).max(200),
      bodyHtml: z.string().optional(),
      bodyText: z.string().min(1),
      template: z.enum(["opportunity_alert", "daily_digest", "weekly_report", "system_update"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      const [queued] = await db
        .insert(emailQueue)
        .values({
          userId,
          toEmail: input.to,
          subject: input.subject,
          bodyHtml: input.bodyHtml ?? null,
          bodyText: input.bodyText,
          template: input.template ?? null,
        })
        .returning();

      return { success: true, queued };
    }),

  // ─── List queued emails ───
  listQueue: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;

    const emails = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.userId, userId))
      .orderBy(desc(emailQueue.createdAt))
      .limit(50);

    return emails;
  }),
});

export type EmailRouter = typeof emailRouter;
