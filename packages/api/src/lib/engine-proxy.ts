import { KestovarEnv } from "./kestovar";

export async function proxyToEngine(env: KestovarEnv, path: string, options: RequestInit = {}) {
  const url = new URL(path, env.apiUrl);
  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": env.apiKey ?? "",
      ...options.headers,
    },
  });
  return response;
}

export async function proxyGet(env: KestovarEnv, path: string) {
  return proxyToEngine(env, path, { method: "GET" });
}

export async function proxyPost(env: KestovarEnv, path: string, body: unknown) {
  return proxyToEngine(env, path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function proxyPut(env: KestovarEnv, path: string, body: unknown) {
  return proxyToEngine(env, path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function proxyDelete(env: KestovarEnv, path: string) {
  return proxyToEngine(env, path, { method: "DELETE" });
}
