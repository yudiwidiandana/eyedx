import { describe, it, expect, vi, afterEach } from "vitest";
import { signToken, verifyToken } from "./jwt";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("JWT secret", () => {
  it("di dev/test tanpa JWT_SECRET tetap bisa sign dan verify dengan nilai bawaan", async () => {
    vi.stubEnv("JWT_SECRET", "");
    vi.stubEnv("NODE_ENV", "test");

    const token = await signToken({ sub: "u1", role: "admin" });

    expect(await verifyToken(token)).toEqual({ sub: "u1", role: "admin" });
  });

  it("di production tanpa JWT_SECRET sign melempar error yang jelas", async () => {
    vi.stubEnv("JWT_SECRET", "");
    vi.stubEnv("NODE_ENV", "production");

    await expect(signToken({ sub: "u1", role: "admin" })).rejects.toThrow("JWT_SECRET wajib");
  });

  it("di production tanpa JWT_SECRET verify melempar error, bukan mengembalikan null", async () => {
    vi.stubEnv("JWT_SECRET", "");
    vi.stubEnv("NODE_ENV", "production");

    await expect(verifyToken("apa-saja")).rejects.toThrow("JWT_SECRET wajib");
  });

  it("di production dengan JWT_SECRET berfungsi normal", async () => {
    vi.stubEnv("JWT_SECRET", "rahasia-uji-panjang-123456");
    vi.stubEnv("NODE_ENV", "production");

    const token = await signToken({ sub: "u2", role: "user" });

    expect(await verifyToken(token)).toEqual({ sub: "u2", role: "user" });
  });

  it("token yang ditandatangani dengan secret lain ditolak", async () => {
    vi.stubEnv("JWT_SECRET", "secret-satu-123456789");
    const token = await signToken({ sub: "u3", role: "user" });

    vi.stubEnv("JWT_SECRET", "secret-dua-987654321");

    expect(await verifyToken(token)).toBeNull();
  });
});
