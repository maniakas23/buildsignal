export function createEngineProxy(env: any) {
  return {
    async fetch(path: string, init?: RequestInit) {
      return env.KESTOVAR?.fetch(path, init) || fetch(`${env.KESTOVAR_API_URL}${path}`, init);
    },
  };
}
