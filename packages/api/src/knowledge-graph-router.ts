import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

export const knowledgeGraphRouter = t.router({
  nodes: publicQuery
    .input(z.object({ type: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { nodes: [] };
    }),

  edges: publicQuery
    .input(z.object({ from: z.string(), to: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { edges: [] };
    }),

  query: publicQuery
    .input(z.object({ query: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { results: [] };
    }),
});
