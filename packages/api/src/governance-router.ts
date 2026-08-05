import { t, publicQuery, authedQuery, adminQuery } from "./router";
import { z } from "zod";

export const governanceRouter = t.router({
  policies: publicQuery.query(async ({ ctx }) => {
    return { policies: [] };
  }),

  createPolicy: adminQuery
    .input(z.object({ name: z.string(), rules: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return { id: "1", name: input.name };
    }),

  audit: publicQuery
    .input(
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return { audit: [] };
    }),

  compliance: publicQuery.query(async ({ ctx }) => {
    return { status: "compliant", checks: [] };
  }),

  dataRetention: adminQuery
    .input(
      z.object({
        table: z.string(),
        days: z.number().min(1),
      }).optional()
    )
    .mutation(async ({ ctx, input }) => {
      return { applied: true };
    }),
});
