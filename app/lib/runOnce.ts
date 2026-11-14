// jalankan fn sekali dan bagikan hasilnya, tapi ulangi dari awal kalau sebelumnya gagal
export function runOnce<A extends unknown[]>(fn: (...args: A) => Promise<void>): (...args: A) => Promise<void> {
  let pending: Promise<void> | null = null;

  return (...args: A) => {
    if (!pending) {
      pending = fn(...args).catch((error) => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };
}
