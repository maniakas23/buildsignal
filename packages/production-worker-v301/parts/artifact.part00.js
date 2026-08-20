var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var RateLimiterDO = class {
  static {
    __name(this, "RateLimiterDO");
  }
  static {
    __name2(this, "RateLimiterDO");
  }
  constructor(state, env2) {
    this.state = state;
    this.env = env2;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const action = url.searchParams.get("action");
    const now = Date.now();
    const windowMs = parseInt(url.searchParams.get("window") || "60000");
    const maxReq = parseInt(url.searchParams.get("max") || "10");
    if (!this.attempts) this.attempts = {};
    if (!this.attempts[key]) this.attempts[key] = [];
    this.attempts[key] = this.attempts[key].filter((t) => now - t < windowMs);
    if (action === "check") {
      const allowed = this.attempts[key].length < maxReq;
      return new Response(JSON.stringify({ allowed, remaining: Math.max(0, maxReq - this.attempts[key].length) }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "record") {
      this.attempts[key].push(now);
      return new Response(JSON.stringify({ recorded: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Unknown action", { status: 400 });
  }
};
function corsHeaders(origin, env2) {
  const allowedOrigins = env2?.ALLOWED_ORIGINS ? env2.ALLOWED_ORIGINS.split(",").map((s) => s.trim()) : ["https://buildsignal.net", "https://www.buildsignal.net", "https://app.buildsignal.net"];
  if (!origin || !allowedOrigins.includes(origin)) {
    return {};
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, stripe-signature",
    "Access-Control-Allow-Credentials": "true"
  };
}
__name(corsHeaders, "corsHeaders");
__name2(corsHeaders, "corsHeaders");
function securityHeaders() {
  return {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.buildsignal.net https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self';"
  };
}
__name(securityHeaders, "securityHeaders");
__name2(securityHeaders, "securityHeaders");
function mergeHeaders(response, extra) {
  const nh = new Headers(response.headers);
  for (const [k, v] of Object.entries(extra)) {
    nh.set(k, v);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: nh });
}
__name(mergeHeaders, "mergeHeaders");
__name2(mergeHeaders, "mergeHeaders");
function toBase64Url(input) {
  const base64 = btoa(input);
  let output = "";
  for (let i = 0; i < base64.length; i++) {
    const c = base64.charAt(i);
    if (c === "=") break;
    if (c === "+") output += "-";
    else if (c === "/") output += "_";
    else output += c;
  }
  return output;
}
__name(toBase64Url, "toBase64Url");
__name2(toBase64Url, "toBase64Url");
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return saltB64 + ":" + hashB64;
}
__name(hashPassword, "hashPassword");
__name2(hashPassword, "hashPassword");
async function verifyPassword(password, stored) {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const salt = Uint8Array.from(atob(parts[0]), (c) => c.charCodeAt(0));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashBytes = new Uint8Array(hash);
  const storedHash = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
  if (hashBytes.length !== storedHash.length) return false;
  let result = 0;
  for (let i = 0; i < hashBytes.length; i++) {
    result |= hashBytes[i] ^ storedHash[i];
  }
  return result === 0;
}
__name(verifyPassword, "verifyPassword");
__name2(verifyPassword, "verifyPassword");
async function verifyJWT(token, secret) {
  if (!token || !secret) return null;
  try {
    const [h, p, sg] = token.split(".");
    if (!h || !p || !sg) return null;
    const payload = JSON.parse(atob(p));
    if (payload.exp && payload.exp * 1e3 < Date.now()) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sig = Uint8Array.from(atob(sg.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sig, enc.encode(h + "." + p));
    return valid ? payload : null;
  } catch (e) {
    return null;
  }
}
__name(verifyJWT, "verifyJWT");
__name2(verifyJWT, "verifyJWT");
function normalizeTimestamp(ts) {
  if (ts === null || ts === void 0) return null;
  if (typeof ts === "string") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const num = Number(ts);
  if (isNaN(num) || num <= 0) return null;
  if (num < 1e11) {
    return new Date(num * 1e3).toISOString();
  }
  return new Date(num).toISOString();
}
__name(normalizeTimestamp, "normalizeTimestamp");
__name2(normalizeTimestamp, "normalizeTimestamp");
function normalizeTimestampToMs(ts) {
  if (ts === null || ts === void 0) return null;
  if (typeof ts === "string") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.getTime();
  }
  const num = Number(ts);
  if (isNaN(num) || num <= 0) return null;
  if (num < 1e11) {
    return num * 1e3;
  }
  return num;
}
__name(normalizeTimestampToMs, "normalizeTimestampToMs");
__name2(normalizeTimestampToMs, "normalizeTimestampToMs");
function d1Safe(value) {
  if (value === void 0) return null;
  if (value === null) return null;
  if (typeof value === "number" && isNaN(value)) return null;
  return value;
}
__name(d1Safe, "d1Safe");
__name2(d1Safe, "d1Safe");
function d1SafeParams(params) {
  if (!params || !Array.isArray(params)) return params;
  return params.map(d1Safe);
}
__name(d1SafeParams, "d1SafeParams");
__name2(d1SafeParams, "d1SafeParams");
function normalizeTimestampToDate(ts) {
  const iso = normalizeTimestamp(ts);
  return iso ? iso.split("T")[0] : null;
}
__name(normalizeTimestampToDate, "normalizeTimestampToDate");
__name2(normalizeTimestampToDate, "normalizeTimestampToDate");
function trpcResult(data) {
  return { result: { data } };
}
__name(trpcResult, "trpcResult");
__name2(trpcResult, "trpcResult");
function trpcError(message, code) {
  return { error: { message, code: code || "INTERNAL_SERVER_ERROR" } };
}
__name(trpcError, "trpcError");
__name2(trpcError, "trpcError");
async function d1Query(db, sql, params) {
  if (!db) throw new Error("DB unavailable");
  const stmt = db.prepare(sql);
  const safeParams = d1SafeParams(params);
  const bound = safeParams && safeParams.length > 0 ? stmt.bind(...safeParams) : stmt;
  return bound.all();
}
__name(d1Query, "d1Query");
__name2(d1Query, "d1Query");
async function d1Run(db, sql, params) {
  if (!db) throw new Error("DB unavailable");
  const stmt = db.prepare(sql);
  const safeParams = d1SafeParams(params);
  const bound = safeParams && safeParams.length > 0 ? stmt.bind(...safeParams) : stmt;
  return bound.run();
}
__name(d1Run, "d1Run");
__name2(d1Run, "d1Run");
var AUTH_FAILURE = "Invalid email or password.";
async function checkRateLimit(env2, key, maxRequests, windowMs) {
  try {
    const id = env2.RATE_LIMITER.idFromName(key);
    const stub = env2.RATE_LIMITER.get(id);
    const checkUrl = new URL("http://internal/check");
    checkUrl.searchParams.set("key", key);
    checkUrl.searchParams.set("action", "check");
    checkUrl.searchParams.set("max", String(maxRequests));
    checkUrl.searchParams.set("window", String(windowMs));
    const res = await stub.fetch(checkUrl.toString());
    const data = await res.json();
    return data.allowed;
  } catch (e) {
    console.error("[rateLimit] error:", e.message);
    return true;
  }
}
__name(checkRateLimit, "checkRateLimit");
__name2(checkRateLimit, "checkRateLimit");
async function recordRateLimit(env2, key) {
  try {
    const id = env2.RATE_LIMITER.idFromName(key);
    const stub = env2.RATE_LIMITER.get(id);
    const url = new URL("http://internal/record");
    url.searchParams.set("key", key);
    url.searchParams.set("action", "record");
    await stub.fetch(url.toString());
  } catch (e) {
    console.error("[rateLimit] reco