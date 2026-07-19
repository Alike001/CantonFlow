import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLedgerApiToken,
  resetLedgerApiTokenCacheForTests,
} from "@/lib/canton/ledger-token";

const managedKeys = [
  "LEDGER_API_TOKEN",
  "DEVNET_OIDC_TOKEN_URL",
  "DEVNET_M2M_CLIENT_ID",
  "DEVNET_M2M_CLIENT_SECRET",
  "DEVNET_M2M_AUDIENCE",
  "DEVNET_M2M_SCOPE",
] as const;

const originalValues = new Map(managedKeys.map((key) => [key, process.env[key]]));

function clearEnvironment() {
  for (const key of managedKeys) delete process.env[key];
}

afterEach(() => {
  clearEnvironment();
  for (const [key, value] of originalValues) {
    if (value !== undefined) process.env[key] = value;
  }
  resetLedgerApiTokenCacheForTests();
  vi.unstubAllGlobals();
});

describe("DevNet Ledger API token provider", () => {
  it("refreshes once and reuses an unexpired M2M token", async () => {
    clearEnvironment();
    process.env.DEVNET_OIDC_TOKEN_URL = "https://issuer.example/token";
    process.env.DEVNET_M2M_CLIENT_ID = "client";
    process.env.DEVNET_M2M_CLIENT_SECRET = "secret";
    process.env.DEVNET_M2M_AUDIENCE = "audience";
    process.env.DEVNET_M2M_SCOPE = "daml_ledger_api";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ access_token: "refreshed-token", expires_in: 3600 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLedgerApiToken()).resolves.toBe("refreshed-token");
    await expect(getLedgerApiToken()).resolves.toBe("refreshed-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://issuer.example/token");
  });

  it("uses a static token only when M2M credentials are absent", async () => {
    clearEnvironment();
    process.env.LEDGER_API_TOKEN = "static-token";

    await expect(getLedgerApiToken()).resolves.toBe("static-token");
  });
});
