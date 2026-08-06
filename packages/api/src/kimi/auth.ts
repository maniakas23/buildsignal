/**
 * Kimi OAuth Authentication — Build 110 / v1.1.0
 * Updated plan validation to canonical 4-tier plans
 */

import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

const JWT_SECRET = new TextEncoder().encode(process.env.APP_SECRET || "dev-secret-change-in-production");
const KIMI_AUTH_URL = process.env.KIMI_AUTH_URL || "https://kimi.moonshot.cn";
const APP_ID = process.env.APP_ID || "";

// ─── Canonical 4-tier plans ───
const VALID_PLANS = ["scout", "professional", "business", "enterprise", "starter"];

export const authSchema = z.object({
  union_id: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  email: z.string().email().optional(),
  plan: z.enum(["scout", "professional", "business", "enterprise", "starter"] as [string, ...string[]]).default("starter"),
});

export type AuthUser = z.infer<typeof authSchema>;

export function createOAuthCallbackHandler() {
  return async (c: any) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");

    if (error) {
      return c.json({ error: "OAuth failed", detail: error }, 400);
    }

    if (!code) {
      return c.json({ error: "Missing authorization code" }, 400);
    }

    try {
      // Exchange code for token
      const tokenResponse = await fetch(`${KIMI_AUTH_URL}/api/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          client_id: APP_ID,
          client_secret: process.env.APP_SECRET,
        }),
      });

      if (!tokenResponse.ok) {
        return c.json({ error: "Token exchange failed" }, 400);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get user info
      const userResponse = await fetch(`${KIMI_AUTH_URL}/api/oauth/user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        return c.json({ error: "Failed to get user info" }, 400);
      }

      const userData = await userResponse.json();

      // Validate plan
      const plan = VALID_PLANS.includes(userData.plan?.toLowerCase())
        ? userData.plan.toLowerCase()
        : "starter";

      const user = {
        union_id: userData.union_id,
        name: userData.name,
        avatar: userData.avatar,
        email: userData.email,
        plan,
      };

      // Create JWT
      const token = await new SignJWT({ user })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      // Set cookie
      setCookie(c, "auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      // Redirect to app
      return c.redirect("https://app.buildsignal.com/dashboard");
    } catch (e) {
      return c.json({ error: "Authentication failed" }, 500);
    }
  };
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload.user as AuthUser;
  } catch {
    return null;
  }
}

export function createLogoutHandler() {
  return async (c: any) => {
    deleteCookie(c, "auth_token", { path: "/" });
    return c.json({ success: true });
  };
}
