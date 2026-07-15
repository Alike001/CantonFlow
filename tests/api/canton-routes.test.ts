import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCantonConfig: vi.fn((role: string) => ({ role })),
  getMissingCantonEnv: vi.fn(() => []),
  getLedgerEnd: vi.fn(),
  readRoleContracts: vi.fn(),
  authorizeCantonRole: vi.fn(async (allowed: string[], localRole?: string) => ({
    role: localRole || allowed[0],
  })),
}));

vi.mock("@/lib/canton/config", () => ({
  getCantonConfig: mocks.getCantonConfig,
  getMissingCantonEnv: mocks.getMissingCantonEnv,
}));

vi.mock("@/lib/canton/json-ledger-api", () => ({
  getLedgerEnd: mocks.getLedgerEnd,
}));

vi.mock("@/lib/canton/read-models", () => ({
  readRoleContracts: mocks.readRoleContracts,
}));

vi.mock("@/lib/auth/session", () => ({
  authorizeCantonRole: mocks.authorizeCantonRole,
}));

const { POST: postInvite } = await import("../../src/app/api/canton/invites/route");
const { POST: postFundingRound } = await import(
  "../../src/app/api/canton/funding-rounds/route"
);
const { POST: postAgreement } = await import("../../src/app/api/canton/agreements/route");
const { POST: postBid } = await import("../../src/app/api/canton/bids/route");
const { GET: getLenderWorkspace } = await import(
  "../../src/app/api/canton/lender-workspace/route"
);
const { GET: getCantonStatus } = await import("../../src/app/api/canton/status/route");

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/canton/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Canton API validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invite without a lender role and funding round reference", async () => {
    const response = await postInvite(
      jsonRequest({ invoiceRequestContractId: "contract-1" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid invite payload",
    });
  });

  it("rejects a funding-round request without the consumed invoice request contract", async () => {
    const response = await postFundingRound(jsonRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid funding round payload",
    });
  });

  it("rejects bid acceptance without the supplier-owned funding round contract", async () => {
    const response = await postAgreement(
      jsonRequest({
        fundingBidContractId: "bid-1",
        acceptedAt: "2026-07-15T12:00:00.000Z",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid agreement payload",
    });
  });

  it("rejects a bid for an unknown lender role", async () => {
    const response = await postBid(
      jsonRequest({
        lenderInviteContractId: "invite-1",
        advanceAmount: "252000.0",
        discountRate: "4.9",
        settlementDays: 61,
        lenderNote: "Test bid",
        submittedAt: "2026-07-15T12:00:00.000Z",
        lender: "lenderC",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid bid payload",
    });
  });

  it("uses the authorized lender party instead of the lender role supplied by the client", async () => {
    mocks.authorizeCantonRole.mockResolvedValueOnce({ role: "lenderA" });
    const response = await postBid(
      jsonRequest({
        lenderInviteContractId: "invite-1",
        advanceAmount: "252000.0",
        discountRate: "4.4",
        settlementDays: 61,
        lenderNote: "Test bid",
        submittedAt: "2026-07-15T12:00:00.000Z",
        lender: "lenderB",
      }),
    );

    expect(mocks.getCantonConfig).toHaveBeenCalledWith("lenderA");
    expect(response.status).toBe(502);
  });

  it("returns the authorization response before a supplier write", async () => {
    const denied = new Response(JSON.stringify({ error: "Authentication is required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
    mocks.authorizeCantonRole.mockResolvedValueOnce({ response: denied });

    const response = await postFundingRound(jsonRequest({ invoiceRequestContractId: "invoice-1" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Authentication is required",
    });
  });
});

describe("Lender workspace isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads lender B's Canton view when explicitly requested", async () => {
    mocks.readRoleContracts.mockResolvedValue([]);
    const request = new NextRequest(
      "http://localhost/api/canton/lender-workspace?lender=lenderB",
    );

    const response = await getLenderWorkspace(request);

    expect(mocks.getCantonConfig).toHaveBeenCalledWith("lenderB");
    expect(mocks.readRoleContracts).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({ lender: "lenderB", contracts: [] });
  });
});

describe("Canton connectivity preflight", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not report a configured endpoint as ready when the ledger is unreachable", async () => {
    mocks.getCantonConfig.mockReturnValue({
      jsonLedgerApiUrl: "https://json-api.devnet.example",
      packageId: "package-id",
    });
    mocks.getLedgerEnd.mockRejectedValue(new Error("Unauthorized"));

    const response = await getCantonStatus();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ready: false,
      configured: true,
      connected: false,
      error: "Unauthorized",
    });
  });
});
