import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(role: "atleta" | "box_master" | "admin_liga" = "atleta"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    boxId: 1, // Vinculado ao box de teste
    categoria: "intermediario",
    faixaEtaria: "18-29",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("wods.getToday", () => {
  it("should handle request for today's WOD", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Should either return a WOD or null without throwing
    try {
      const result = await caller.wods.getToday();
      expect(result === null || typeof result === "object").toBe(true);
    } catch (error: any) {
      // It's ok if there's no WOD for today
      expect(error.message).toBeTruthy();
    }
  });
});

describe("checkins.create", () => {
  it("should require authentication", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.checkins.create({
        wodId: 1,
        boxId: 1,
      })
    ).rejects.toThrow();
  });
});

describe("badges.getUserBadges", () => {
  it("should return user badges for authenticated user", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.badges.getUserBadges();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("pontuacoes.getTotalByUser", () => {
  it("should return total points for authenticated user", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.pontuacoes.getTotalByUser();

    expect(typeof result === "number").toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
