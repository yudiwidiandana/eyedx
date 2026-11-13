import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { requireRole } from "./requireRole";
import { signToken } from "./jwt";

function makeReq(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/admin/x", { headers });
}

describe("requireRole", () => {
  it("tanpa token -> 401", async () => {
    const res = await requireRole(makeReq(), ["admin"]);
    expect(res.error?.status).toBe(401);
  });

  it("token rusak -> 403", async () => {
    const res = await requireRole(makeReq({ cookie: "next-auth.session-token=rusak" }), ["admin"]);
    expect(res.error?.status).toBe(403);
  });

  it("role tidak diizinkan -> 403", async () => {
    const token = await signToken({ sub: "u1", role: "expert" });
    const res = await requireRole(makeReq({ cookie: `next-auth.session-token=${token}` }), ["admin"]);
    expect(res.error?.status).toBe(403);
  });

  it("role diizinkan lewat cookie -> payload kembali", async () => {
    const token = await signToken({ sub: "u1", role: "admin" });
    const res = await requireRole(makeReq({ cookie: `next-auth.session-token=${token}` }), ["admin"]);
    expect(res.error).toBeUndefined();
    expect(res.payload).toMatchObject({ sub: "u1", role: "admin" });
  });

  it("salah satu dari beberapa role lewat header Authorization -> payload kembali", async () => {
    const token = await signToken({ sub: "e1", role: "expert" });
    const res = await requireRole(makeReq({ authorization: `Bearer ${token}` }), ["admin", "expert"]);
    expect(res.payload).toMatchObject({ sub: "e1", role: "expert" });
  });
});
