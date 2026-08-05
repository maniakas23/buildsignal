import { env } from "../lib/env";

export function getPlatform() {
  return {
    clientId: env.OWNER_UNION_KEY,
    clientSecret: env.OWNER_UNION_SECRET,
    authEndpoint: "https://api.kimi.com/oauth2/authorize",
    tokenEndpoint: "https://api.kimi.com/oauth2/token",
    userEndpoint: "https://api.kimi.com/v1/users/me",
    redirectUri: "https://api.buildsignal.net/auth/callback",
    scopes: "profile email",
  };
}
