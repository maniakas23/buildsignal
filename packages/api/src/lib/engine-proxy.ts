/**
 * Engine Proxy — Build 110 / v1.1.0
 * Stub: all exports return empty arrays for zero-data state
 */

export async function proxyToEngine(_route: string, _req: Request): Promise<Response> {
  return new Response(JSON.stringify({ error: "Engine unavailable" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

export async function getEngineHealth(): Promise<{ status: string; latencyMs: number }> {
  return { status: "unavailable", latencyMs: 0 };
}

export function getEngineProxyRoutes(): string[] {
  return [];
}
