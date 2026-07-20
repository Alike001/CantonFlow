let cachedToken: { value: string; expiresAt: number } | null = null;
let refreshInFlight: Promise<string> | null = null;

const m2mKeys = [
  "DEVNET_OIDC_TOKEN_URL",
  "DEVNET_M2M_CLIENT_ID",
  "DEVNET_M2M_CLIENT_SECRET",
  "DEVNET_M2M_AUDIENCE",
  "DEVNET_M2M_SCOPE",
] as const;

export function hasDevnetM2mConfiguration() {
  return m2mKeys.every((key) => Boolean(process.env[key]));
}

export function hasLedgerApiAuthentication() {
  return Boolean(process.env.LEDGER_API_TOKEN) || hasDevnetM2mConfiguration();
}

async function refreshDevnetToken() {
  const tokenUrl = process.env.DEVNET_OIDC_TOKEN_URL;
  const clientId = process.env.DEVNET_M2M_CLIENT_ID;
  const clientSecret = process.env.DEVNET_M2M_CLIENT_SECRET;
  const audience = process.env.DEVNET_M2M_AUDIENCE;
  const scope = process.env.DEVNET_M2M_SCOPE;

  if (!tokenUrl || !clientId || !clientSecret || !audience || !scope) {
    throw new Error("DevNet M2M OAuth configuration is incomplete");
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience,
      scope,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DevNet token refresh failed (${response.status})`);
  }

  const payload: unknown = await response.json();
  const accessToken =
    payload && typeof payload === "object" && typeof (payload as { access_token?: unknown }).access_token === "string"
      ? (payload as { access_token: string }).access_token
      : null;
  const expiresIn =
    payload && typeof payload === "object" && typeof (payload as { expires_in?: unknown }).expires_in === "number"
      ? (payload as { expires_in: number }).expires_in
      : 300;

  if (!accessToken) {
    throw new Error("DevNet token endpoint returned no access token");
  }

  // Keep a one-minute margin so a request never starts with an expiring token.
  cachedToken = {
    value: accessToken,
    expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000,
  };

  return accessToken;
}

export async function getLedgerApiToken() {
  if (hasDevnetM2mConfiguration()) {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.value;
    }

    if (!refreshInFlight) {
      refreshInFlight = refreshDevnetToken().finally(() => {
        refreshInFlight = null;
      });
    }

    return refreshInFlight;
  }

  if (process.env.LEDGER_API_TOKEN) {
    return process.env.LEDGER_API_TOKEN;
  }

  if (process.env.CANTONFLOW_ALLOW_UNAUTHENTICATED_JSON_API === "true") {
    return null;
  }

  throw new Error("Missing Ledger API authentication");
}

export function resetLedgerApiTokenCacheForTests() {
  cachedToken = null;
  refreshInFlight = null;
}
