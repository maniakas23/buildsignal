import { kestovarRequest } from "./kestovar";
import { KestovarEnv } from "./kestovar";

export async function getEngineHealth(env: KestovarEnv) {
  return kestovarRequest(env, "/health");
}

export async function getEngineReady(env: KestovarEnv) {
  return kestovarRequest(env, "/ready");
}

export async function getEngineVersion(env: KestovarEnv) {
  return kestovarRequest(env, "/version");
}

export async function getEngineCapabilities(env: KestovarEnv) {
  return kestovarRequest(env, "/capabilities");
}

export async function getEngineDashboard(env: KestovarEnv) {
  return kestovarRequest(env, "/dashboard");
}

export async function getEngineProviders(env: KestovarEnv) {
  return kestovarRequest(env, "/providers");
}

export async function getEngineAlerts(env: KestovarEnv) {
  return kestovarRequest(env, "/alerts");
}

export async function getEngineRecommendations(env: KestovarEnv) {
  return kestovarRequest(env, "/recommendations");
}

export async function getEnginePatterns(env: KestovarEnv) {
  return kestovarRequest(env, "/patterns");
}

export async function getEngineProducts(env: KestovarEnv) {
  return kestovarRequest(env, "/products");
}

export async function getEngineEvents(env: KestovarEnv) {
  return kestovarRequest(env, "/events");
}

export async function getEngineStatus(env: KestovarEnv) {
  return kestovarRequest(env, "/status");
}
