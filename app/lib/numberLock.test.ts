import { describe, it, expect, vi } from "vitest";
import { withNumberLock } from "./numberLock";

function fakeConn(gotLock: number | bigint | null) {
  const query = vi.fn(async (sql: string) => (sql.includes("GET_LOCK") ? [{ got: gotLock }] : [{}]));
  return { query, calls: () => query.mock.calls.map((c) => c[0] as string) };
}

describe("withNumberLock", () => {
  it("mengambil kunci, menjalankan fungsi, lalu melepas kunci", async () => {
    const conn = fakeConn(1);

    const result = await withNumberLock(conn, "kunci-a", async () => 42);

    expect(result).toBe(42);
    expect(conn.calls()).toEqual(["SELECT GET_LOCK(?, ?) AS got", "SELECT RELEASE_LOCK(?)"]);
  });

  it("tetap melepas kunci saat fungsi melempar error", async () => {
    const conn = fakeConn(1);

    await expect(withNumberLock(conn, "kunci-a", async () => { throw new Error("insert gagal"); })).rejects.toThrow("insert gagal");

    expect(conn.calls()).toContain("SELECT RELEASE_LOCK(?)");
  });

  it("melempar error jelas dan tidak menjalankan fungsi bila kunci tidak didapat", async () => {
    const conn = fakeConn(0);
    const fn = vi.fn(async () => 1);

    await expect(withNumberLock(conn, "kunci-a", fn)).rejects.toThrow("Gagal mendapat kunci penomoran");

    expect(fn).not.toHaveBeenCalled();
    expect(conn.calls()).not.toContain("SELECT RELEASE_LOCK(?)");
  });

  it("menerima hasil GET_LOCK bertipe bigint dan null", async () => {
    await expect(withNumberLock(fakeConn(BigInt(1)), "k", async () => "ok")).resolves.toBe("ok");
    await expect(withNumberLock(fakeConn(null), "k", async () => "ok")).rejects.toThrow("kunci penomoran");
  });
});
