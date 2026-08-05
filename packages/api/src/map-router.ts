/**
 * BuildSignal Map Router — v3 (Engine-Proxy)
 *
 * ARCHITECTURE: Map markers are fetched from Kestovar Engine via service binding.
 * BuildSignal does NOT query Kestovar tables directly.
 *
 * The Engine owns: events, patterns, recommendations, providers.
 * BuildSignal owns: watchlists, alert preferences, reports, UX state.
 */

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getEngineProxy } from "./lib/engine-proxy";

// NC county approximate coordinates for synthetic marker placement
const COUNTY_COORDS: Record<string, [number, number]> = {
  "Wake": [35.8032, -78.5661],
  "Mecklenburg": [35.2087, -80.8308],
  "Durham": [36.0329, -78.9041],
  "Orange": [36.0645, -79.1006],
  "Guilford": [36.0958, -79.8268],
  "Forsyth": [36.1304, -80.2546],
  "Cumberland": [35.0479, -78.8257],
  "Buncombe": [35.6111, -82.5400],
  "New Hanover": [34.1801, -77.8700],
  "Union": [34.9835, -80.5410],
  "Cabarrus": [35.3879, -80.5526],
  "Iredell": [35.8075, -80.8737],
  "Gaston": [35.2953, -81.1777],
  "Johnston": [35.5196, -78.3615],
  "Brunswick": [34.0395, -78.2270],
  "Davidson": [35.7871, -80.2284],
  "Catawba": [35.6628, -81.2140],
  "Alamance": [36.0437, -79.3978],
  "Moore": [35.3039, -79.4811],
  "Rowan": [35.6402, -80.5244],
};

export const mapRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        type: z.string().optional(),
        county: z.string().optional(),
        state: z.string().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const engine = getEngineProxy(ctx.env ?? {});

      try {
        // Fetch signals from Kestovar Engine via service binding
        const filters: Record<string, unknown> = { limit: 500 };
        if (input?.county) filters.county = input.county;
        if (input?.state) filters.state = input.state;

        const result = await engine.call("live.signals", filters);
        const signals = (result as any)?.signals || [];

        return signals.map((row: any, index: number) => {
          const county = row.county || "Wake";
          const baseCoords = COUNTY_COORDS[county] || [35.5 + (Math.random() - 0.5) * 2, -79.0 + (Math.random() - 0.5) * 3];
          // Jitter coordinates so markers don't stack on top of each other
          const jitter = 0.02;
          const lat = baseCoords[0] + (index % 5 - 2) * jitter + (Math.random() - 0.5) * 0.01;
          const lng = baseCoords[1] + (Math.floor(index / 5) % 5 - 2) * jitter + (Math.random() - 0.5) * 0.01;
          const confidence = row.confidence_score || row.confidence || 50;

          return {
            id: row.id || row.event_id || `evt-${index}`,
            event_id: row.event_id || row.id || `evt-${index}`,
            title: row.title || row.name || `${row.event_type || "signal"} in ${county}`,
            description: row.description || `${row.event_type || "signal"} event`,
            type: row.event_type || row.source_type || "signal",
            score: confidence,
            confidence: confidence,
            status: confidence >= 80 ? "hot" : confidence >= 60 ? "active" : "pending",
            county: county,
            state: row.state || "NC",
            city: row.city || county,
            lat: String(lat),
            lng: String(lng),
            data_source: row.data_source || row.source || "unknown",
            ingested_at: row.ingested_at || row.createdAt || new Date().toISOString(),
            source_url: row.source_url || null,
          };
        });
      } catch (err) {
        console.error("[map/list] Engine error:", err);
        return { status: "UNAVAILABLE" as const, markers: [] };
      }
    }),
});



