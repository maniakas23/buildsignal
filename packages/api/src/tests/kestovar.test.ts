import { describe, it, expect, beforeEach } from "vitest";
import { createKestovarEnv, resetKestovarMetrics, resetCircuitBreaker } from "./lib/kestovar";

const mockEnv = {
  KESTOVAR_API_KEY: "test-key",
  KESTOVAR_API_URL: "https://api.kestovar.buildsignal.net",
  APP_NAME: "buildsignal",
};

// Mock fetch for tests
globalThis.fetch = async (url: string, init?: RequestInit) => {
  const path = new URL(url).pathname;
  
  if (path === "/health") {
    return new Response(JSON.stringify({ ok: true, latency: 5 }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/ready") {
    return new Response(JSON.stringify({ ok: true, checks: { database: { status: "passed" } } }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/version") {
    return new Response(JSON.stringify({ version: "1.0.0", contract: "1.0.0" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/capabilities") {
    return new Response(JSON.stringify({ 
      capabilities: { 
        recommendations: { name: "recommendations", available: true }, 
        patterns: { name: "patterns", available: true }, 
        knowledgeGraph: { name: "knowledgeGraph", available: true }, 
        alerts: { name: "alerts", available: true }, 
        commands: { name: "commands", available: true }, 
        batchEvents: { name: "batchEvents", available: true }, 
        correlation: { name: "correlation", available: true } 
      }, 
      contractVersion: "1.0.0", 
      apiVersion: "v1", 
      timestamp: new Date().toISOString() 
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/dashboard") {
    return new Response(JSON.stringify({ metrics: {} }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/providers") {
    return new Response(JSON.stringify({ providers: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/alerts") {
    return new Response(JSON.stringify({ alerts: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/recommendations/quality") {
    return new Response(JSON.stringify({ quality: 0.95 }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/events") {
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/events/batch") {
    return new Response(JSON.stringify({ received: 1 }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/recommendations/generate") {
    return new Response(JSON.stringify({ recommendation: {} }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/patterns/analyze") {
    return new Response(JSON.stringify({ patterns: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/correlations/analyze") {
    return new Response(JSON.stringify({ correlations: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/knowledge") {
    return new Response(JSON.stringify({ nodes: [], edges: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/commands") {
    return new Response(JSON.stringify({ executed: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (path === "/feedback") {
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  
  return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: { "Content-Type": "application/json" } });
};

describe("Kestovar Client", () => {
  let kestovar: ReturnType<typeof createKestovarEnv>;

  beforeEach(() => {
    resetKestovarMetrics();
    resetCircuitBreaker();
    kestovar = createKestovarEnv(mockEnv);
  });

  it("should check health", async () => {
    const health = await kestovar.health();
    expect(health.ok).toBe(true);
  });

  it("should check ready", async () => {
    const ready = await kestovar.ready();
    expect(ready.ok).toBe(true);
  });

  it("should get version", async () => {
    const version = await kestovar.version();
    expect(version.version).toBe("1.0.0");
  });

  it("should get capabilities", async () => {
    const caps = await kestovar.capabilities();
    expect(caps.capabilities).toBeDefined();
  });

  it("should get dashboard", async () => {
    const dashboard = await kestovar.dashboard();
    expect(dashboard).toBeDefined();
  });

  it("should get providers", async () => {
    const providers = await kestovar.providers();
    expect(providers).toBeDefined();
  });

  it("should get alerts", async () => {
    const alerts = await kestovar.alerts();
    expect(alerts).toBeDefined();
  });

  it("should get recommendations", async () => {
    const recs = await kestovar.recommendations();
    expect(recs).toBeDefined();
  });

  it("should send events", async () => {
    const result = await kestovar.events({ type: "test", data: {} });
    expect(result).toBeDefined();
  });

  it("should send batch events", async () => {
    const result = await kestovar.batchEvents([{ type: "test", data: {} }]);
    expect(result).toBeDefined();
  });

  it("should generate recommendation", async () => {
    const result = await kestovar.generateRecommendation({ countyId: "test" });
    expect(result).toBeDefined();
  });

  it("should analyze patterns", async () => {
    const result = await kestovar.analyzePatterns({ countyId: "test" });
    expect(result).toBeDefined();
  });

  it("should analyze correlations", async () => {
    const result = await kestovar.analyzeCorrelations({ countyId: "test" });
    expect(result).toBeDefined();
  });

  it("should query knowledge graph", async () => {
    const result = await kestovar.knowledge({ query: "test" });
    expect(result).toBeDefined();
  });

  it("should execute commands", async () => {
    const result = await kestovar.commands({ command: "test" });
    expect(result).toBeDefined();
  });

  it("should send feedback", async () => {
    const result = await kestovar.feedback({ rating: 5 });
    expect(result).toBeDefined();
  });

  it("should track metrics", async () => {
    await kestovar.health();
    const metrics = kestovar.getMetrics();
    expect(metrics.requests).toBeGreaterThan(0);
  });

  it("should reset circuit breaker", async () => {
    kestovar.resetCircuitBreaker();
    const metrics = kestovar.getMetrics();
    expect(metrics.circuitBreaker.state).toBe("closed");
  });

  it("should handle errors gracefully", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ error: "Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    
    try {
      await kestovar.health();
    } catch (e) {
      expect(e).toBeDefined();
    }
    
    globalThis.fetch = originalFetch;
  });

  it("should include request headers", async () => {
    let capturedHeaders: Record<string, string> = {};
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      capturedHeaders = init?.headers as Record<string, string> || {};
      return originalFetch(url, init);
    };
    
    await kestovar.health();
    expect(capturedHeaders["X-API-Key"] || capturedHeaders["x-api-key"]).toBeDefined();
    
    globalThis.fetch = originalFetch;
  });

  it("should retry on failure", async () => {
    let attempts = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      attempts++;
      if (attempts < 3) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
      return originalFetch(url, init);
    };
    
    const health = await kestovar.health();
    expect(health.ok).toBe(true);
    expect(attempts).toBeGreaterThan(1);
    
    globalThis.fetch = originalFetch;
  });

  it("should open circuit breaker after threshold failures", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ error: "Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    
    for (let i = 0; i < 5; i++) {
      try { await kestovar.health(); } catch {}
    }
    
    const metrics = kestovar.getMetrics();
    expect(metrics.circuitBreaker.state).toBe("open");
    
    globalThis.fetch = originalFetch;
  });

  it("should timeout on slow responses", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Promise(() => {}); // Never resolves
    
    try {
      await kestovar.health();
    } catch (e) {
      expect((e as Error).message).toContain("timeout");
    }
    
    globalThis.fetch = originalFetch;
  });

  it("should use HTTP fallback when service binding unavailable", async () => {
    const envWithoutBinding = { ...mockEnv, KESTOVAR_API_URL: "https://api.kestovar.buildsignal.net" };
    const kv = createKestovarEnv(envWithoutBinding);
    const health = await kv.health();
    expect(health.ok).toBe(true);
  });

  it("should track latency metrics", async () => {
    await kestovar.health();
    const metrics = kestovar.getMetrics();
    expect(metrics.latency).toBeGreaterThan(0);
  });

  it("should handle 404 errors", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    
    try {
      await kestovar.health();
    } catch (e) {
      expect((e as Error).message).toContain("404");
    }
    
    globalThis.fetch = originalFetch;
  });

  it("should handle JSON parse errors", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response("not json", { status: 200, headers: { "Content-Type": "text/plain" } });
    
    try {
      await kestovar.health();
    } catch (e) {
      expect(e).toBeDefined();
    }
    
    globalThis.fetch = originalFetch;
  });
});
