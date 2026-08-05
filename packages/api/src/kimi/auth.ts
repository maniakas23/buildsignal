import { getPlatform } from "./platform";
import type { OAuthToken } from "./types";

const PLATFORM = getPlatform();

export async function exchangeCodeForToken(code: string): Promise<OAuthToken> {
  const response = await fetch(`${PLATFORM.tokenEndpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: PLATFORM.clientId,
      client_secret: PLATFORM.clientSecret,
      redirect_uri: PLATFORM.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth exchange failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthToken> {
  const response = await fetch(`${PLATFORM.tokenEndpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: PLATFORM.clientId,
      client_secret: PLATFORM.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

export async function fetchUserProfile(accessToken: string) {
  const response = await fetch(`${PLATFORM.userEndpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Profile fetch failed: ${response.status}`);
  }

  return response.json();
}

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: PLATFORM.clientId,
    redirect_uri: PLATFORM.redirectUri,
    response_type: "code",
    scope: PLATFORM.scopes,
    state,
  });
  return `${PLATFORM.authEndpoint}?${params.toString()}`;
}
