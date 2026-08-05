/**
 * Watchlist Router — CRUD for customer watchlists.
 * Users create named collections of counties to monitor.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

export const watchlistRouter = createRouter({
  // List all watchlists for a user
  list: authedQuery
    .input(z.object({ userId: z.number() }).optional())
    .query(async ({ ctx }) => {
      const d1 = (ctx as any).env?.DB as D1Database;
      if (!d1) return [];

      const userId = ctx.user?.id || 1;
      const result = await d1.prepare("SELECT * FROM watchlists WHERE userId = ? ORDER BY updatedAt DESC")
        .bind(userId).all();
      return (result.results || []).map((w: any) => ({
        ...w,
        counties: w.counties ? JSON.parse(w.counties) : [],
      }));
    }),

  // Get single watchlist
  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const d1 = (ctx as any).env?.DB as D1Database;
      if (!d1) return null;

      const row = await d1.prepare("SELECT * FROM watchlists WHERE id = ?").bind(input.id).first();
      if (!row) return null;
      return {
        ...row,
        counties: (row as any).counties ? JSON.parse((row as any).counties) : [],
      };
    }),

  // Create watchlist
  create: authedQuery
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      counties: z.array(z.object({ county: z.string(), state: z.string() })),
      alertEnabled: z.boolean().default(true),
      alertFrequency: z.enum(["daily", "weekly", "instant"]).default("daily"),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1 = (ctx as any).env?.DB as D1Database;
      if (!d1) throw new Error("Database not available");

      const userId = ctx.user?.id || 1;
      const now = Math.floor(Date.now() / 1000);

      const result = await d1.prepare(
        `INSERT INTO watchlists (userId, name, description, counties, alertEnabled, alertFrequency, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(userId, input.name, input.description || null, JSON.stringify(input.counties),
        input.alertEnabled ? 1 : 0, input.alertFrequency, now, now).run();

      return { success: true, id: result.meta?.last_row_id };
    }),

  // Update watchlist
  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      counties: z.array(z.object({ county: z.string(), state: z.string() })).optional(),
      alertEnabled: z.boolean().optional(),
      alertFrequency: z.enum(["daily", "weekly", "instant"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1 = (ctx as any).env?.DB as D1Database;
      if (!d1) throw new Error("Database not available");

      const now = Math.floor(Date.now() / 1000);
      const updates: string[] = [];
      const values: any[] = [];

      if (input.name !== undefined) { updates.push("name = ?"); values.push(input.name); }
      if (input.description !== undefined) { updates.push("description = ?"); values.push(input.description); }
      if (input.counties !== undefined) { updates.push("counties = ?"); values.push(JSON.stringify(input.counties)); }
      if (input.alertEnabled !== undefined) { updates.push("alertEnabled = ?"); values.push(input.alertEnabled ? 1 : 0); }
      if (input.alertFrequency !== undefined) { updates.push("alertFrequency = ?"); values.push(input.alertFrequency); }
      updates.push("updatedAt = ?"); values.push(now);
      values.push(input.id);

      await d1.prepare(`UPDATE watchlists SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
      return { success: true };
    }),

  // Delete watchlist
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const d1 = (ctx as any).env?.DB as D1Database;
      if (!d1) throw new Error("Database not available");

      await d1.prepare("DELETE FROM watchlists WHERE id = ?").bind(input.id).run();
      return { success: true };
    }),

  // Toggle alerts
  toggleAlert: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const d1 = (ctx as any).env?.DB as D1Database;
      if (!d1) throw new Error("Database not available");

      const watchlist = await d1.prepare("SELECT alertEnabled FROM watchlists WHERE id = ?").bind(input.id).first();
      const newState = (watchlist as any)?.alertEnabled ? 0 : 1;
      await d1.prepare("UPDATE watchlists SET alertEnabled = ? WHERE id = ?").bind(newState, input.id).run();
      return { success: true, alertEnabled: newState === 1 };
    }),
});

