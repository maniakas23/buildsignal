import type { OAuthToken } from "./types";

export function createSession(token: OAuthToken): string {
  const session = {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt: Date.now() + token.expiresIn * 1000,
  };
  return btoa(JSON.stringify(session));
}

export function parseSession(sessionCookie: string): OAuthToken | null {
  try {
    const session = JSON.parse(atob(sessionCookie));
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: Math.floor((session.expiresAt - Date.now()) / 1000),
      tokenType: "Bearer",
    };
  } catch {
    return null;
  }
}
