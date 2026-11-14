const LOCK_TIMEOUT_SECONDS = 10;

type Queryable = { query: (sql: string, params?: unknown[]) => Promise<unknown> };

// kunci bernama MariaDB menyerialkan pembuat nomor antar koneksi tanpa risiko deadlock
export async function withNumberLock<T>(conn: Queryable, name: string, fn: () => Promise<T>): Promise<T> {
  const rows = (await conn.query("SELECT GET_LOCK(?, ?) AS got", [name, LOCK_TIMEOUT_SECONDS])) as { got: number | bigint }[];
  if (Number(rows[0]?.got) !== 1) {
    throw new Error("Gagal mendapat kunci penomoran, coba lagi");
  }

  try {
    return await fn();
  } finally {
    await conn.query("SELECT RELEASE_LOCK(?)", [name]);
  }
}
