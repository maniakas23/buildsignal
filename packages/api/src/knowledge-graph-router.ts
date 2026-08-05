/**
 * Knowledge Graph Router — Gate 18 Section 3
 * Infrastructure Knowledge Graph: nodes, edges, correlations, relationships.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const knowledgeGraphRouter = createRouter({
  // ─── List nodes (optionally filtered) ───
  nodes: authedQuery
    .input(z.object({ nodeType: z.string().optional(), county: z.string().optional(), state: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { nodes: [] };
      try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        if (input?.nodeType) { conditions.push(`nodeType = ?`); params.push(input.nodeType); }
        if (input?.county) { conditions.push(`county = ?`); params.push(input.county); }
        if (input?.state) { conditions.push(`state = ?`); params.push(input.state); }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM knowledge_graph_nodes ${where} ORDER BY confidence DESC LIMIT 50`;
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { nodes: results || [] };
      } catch { return { nodes: [] }; }
    }),

  // ─── Get edges for a node ───
  edges: authedQuery
    .input(z.object({ nodeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { edges: [] };
      try {
        const { results } = await d1.prepare(
          `SELECT e.*, ns.label as sourceLabel, ns.nodeType as sourceType, nt.label as targetLabel, nt.nodeType as targetType
           FROM knowledge_graph_edges e
           JOIN knowledge_graph_nodes ns ON e.sourceId = ns.id
           JOIN knowledge_graph_nodes nt ON e.targetId = nt.id
           WHERE e.sourceId = ? OR e.targetId = ? ORDER BY e.strength DESC`
        ).bind(input.nodeId, input.nodeId).all();
        return { edges: results || [] };
      } catch { return { edges: [] }; }
    }),

  // ─── Find correlations between nodes ───
  correlations: authedQuery
    .input(z.object({ nodeType: z.string().optional(), county: z.string().optional(), state: z.string().optional(), minStrength: z.number().default(50) }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { correlations: [] };
      try {
        let sql = `SELECT e.*, ns.label as sourceLabel, ns.nodeType as sourceType, ns.county as sourceCounty, ns.state as sourceState,
                   nt.label as targetLabel, nt.nodeType as targetType, nt.county as targetCounty, nt.state as targetState
                   FROM knowledge_graph_edges e
                   JOIN knowledge_graph_nodes ns ON e.sourceId = ns.id
                   JOIN knowledge_graph_nodes nt ON e.targetId = nt.id
                   WHERE e.strength >= ?`;
        const params: (string | number)[] = [input?.minStrength || 50];
        if (input?.county) { sql += ` AND (ns.county = ? OR nt.county = ?)`; params.push(input.county, input.county); }
        if (input?.state) { sql += ` AND (ns.state = ? OR nt.state = ?)`; params.push(input.state, input.state); }
        if (input?.nodeType) { sql += ` AND (ns.nodeType = ? OR nt.nodeType = ?)`; params.push(input.nodeType, input.nodeType); }
        sql += ` ORDER BY e.strength DESC LIMIT 50`;
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { correlations: results || [] };
      } catch { return { correlations: [] }; }
    }),

  // ─── Graph stats ───
  stats: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { nodeCount: 0, edgeCount: 0, avgCorrelationStrength: 0, nodeTypes: [], avgNodeConfidence: 0 };
    try {
      const nodeCount = await d1.prepare(`SELECT COUNT(*) as c FROM knowledge_graph_nodes`).first<{ c: number }>();
      const edgeCount = await d1.prepare(`SELECT COUNT(*) as c FROM knowledge_graph_edges`).first<{ c: number }>();
      const relCount = await d1.prepare(`SELECT COUNT(*) as c FROM kg_relationships`).first<{ c: number }>();
      const avgStrength = await d1.prepare(`SELECT AVG(strength) as c FROM knowledge_graph_edges`).first<{ c: number }>();
      const avgConf = await d1.prepare(`SELECT AVG(confidence) as c FROM knowledge_graph_nodes`).first<{ c: number }>();
      const { results: nodeTypes } = await d1.prepare(`SELECT nodeType, COUNT(*) as count FROM knowledge_graph_nodes GROUP BY nodeType`).all<{ nodeType: string; count: number }>();
      return {
        nodeCount: nodeCount?.c || 0,
        edgeCount: edgeCount?.c || 0,
        relationshipCount: relCount?.c || 0,
        avgCorrelationStrength: Math.round(avgStrength?.c || 0),
        avgNodeConfidence: Math.round(avgConf?.c || 0),
        nodeTypes: nodeTypes || [],
      };
    } catch { return { nodeCount: 0, edgeCount: 0, relationshipCount: 0, avgCorrelationStrength: 0, nodeTypes: [], avgNodeConfidence: 0 }; }
  }),

  // ─── Gate 19 Section 3: Infrastructure Relationships ───
  relationships: authedQuery
    .input(z.object({
      sourceNodeId: z.number().optional(),
      targetNodeId: z.number().optional(),
      relationType: z.string().optional(),
      minStrength: z.number().default(30),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, relationships: [] };
      try {
        let sql = `SELECT r.*, ns.label as sourceLabel, ns.nodeType as sourceType, nt.label as targetLabel, nt.nodeType as targetType
                   FROM kg_relationships r
                   JOIN knowledge_graph_nodes ns ON r.sourceNodeId = ns.id
                   JOIN knowledge_graph_nodes nt ON r.targetNodeId = nt.id
                   WHERE r.strength >= ?`;
        const params: (string | number)[] = [input?.minStrength || 30];
        if (input?.sourceNodeId) { sql += ` AND r.sourceNodeId = ?`; params.push(input.sourceNodeId); }
        if (input?.targetNodeId) { sql += ` AND r.targetNodeId = ?`; params.push(input.targetNodeId); }
        if (input?.relationType) { sql += ` AND r.relationType = ?`; params.push(input.relationType); }
        sql += ` ORDER BY r.strength DESC LIMIT ?`;
        params.push(input?.limit || 50);
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { relationships: results || [] };
      } catch { return { status: "UNAVAILABLE" as const, relationships: [] }; }
    }),

  // ─── Relationship types summary ───
  relationshipTypes: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, types: [] };
    try {
      const { results } = await d1.prepare(`SELECT relationType, COUNT(*) as count, AVG(strength) as avgStrength FROM kg_relationships GROUP BY relationType ORDER BY count DESC`).all();
      return { types: results || [] };
    } catch { return { status: "UNAVAILABLE" as const, types: [] }; }
  }),
});


