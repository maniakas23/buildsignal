export interface EngineAdapter {
  health(): Promise<{ ok: boolean; latency: number }>;
  ready(): Promise<{ ok: boolean; checks: Record<string, any> }>;
  capabilities(): Promise<any>;
}

export function createEngineAdapter(env: any): EngineAdapter {
  return {
    async health() {
      return { ok: true, latency: 1 };
    },
    async ready() {
      return { ok: true, checks: {} };
    },
    async capabilities() {
      return { capabilities: {} };
    },
  };
}
