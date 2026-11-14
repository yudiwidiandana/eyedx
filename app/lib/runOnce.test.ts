import { describe, it, expect, vi } from "vitest";
import { runOnce } from "./runOnce";

describe("runOnce", () => {
  it("hanya menjalankan fungsi sekali untuk banyak panggilan berurutan", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const once = runOnce(fn);

    await once();
    await once();
    await once();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("panggilan bersamaan berbagi satu promise", async () => {
    const fn = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 10)));
    const once = runOnce(fn);

    await Promise.all([once(), once(), once(), once(), once()]);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("kegagalan tidak terkunci, panggilan berikutnya mencoba lagi", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("db belum siap"))
      .mockResolvedValue(undefined);
    const once = runOnce(fn);

    await expect(once()).rejects.toThrow("db belum siap");
    await expect(once()).resolves.toBeUndefined();
    await once();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("meneruskan argumen ke fungsi asli", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    await runOnce(fn)("koneksi-1");

    expect(fn).toHaveBeenCalledWith("koneksi-1");
  });
});
