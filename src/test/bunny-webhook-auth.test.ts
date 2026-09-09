import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  logSecurityEvent: vi.fn(async () => undefined),
}));

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/security/audit-logger", () => ({
  logSecurityEvent: mocks.logSecurityEvent,
}));

import { POST } from "@/app/api/webhooks/bunny/route";

function createRequest(url: string, authorization?: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify({ VideoGuid: "video-1", Status: 0 }),
  });
}

describe("Bunny webhook authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BUNNY_WEBHOOK_SECRET", "");
    vi.stubEnv("BUNNY_STREAM_API_KEY", "");
  });

  it("fails closed before payload handling when production has no credential", async () => {
    const response = await POST(
      createRequest("http://localhost/api/webhooks/bunny")
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Webhook authentication is not configured.",
    });
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "critical" })
    );
  });

  it("does not accept a configured credential from the query string", async () => {
    vi.stubEnv("BUNNY_WEBHOOK_SECRET", "configured-webhook-secret");

    const response = await POST(
      createRequest(
        "http://localhost/api/webhooks/bunny?token=configured-webhook-secret"
      )
    );

    expect(response.status).toBe(401);
  });

  it("accepts the configured credential from the authorization header", async () => {
    vi.stubEnv("BUNNY_WEBHOOK_SECRET", "configured-webhook-secret");

    const response = await POST(
      createRequest(
        "http://localhost/api/webhooks/bunny",
        "Bearer configured-webhook-secret"
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      videoGuid: "video-1",
    });
  });
});
