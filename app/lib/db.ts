import mariadb, { type PoolConnection } from "mariadb";

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "eyedx",
  ssl: process.env.DB_SSL === "false" ? false : true,
  connectionLimit: 5,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  socketTimeout: 60000,
});

export interface SavedDiagnosisResult {
  id: string;
  name: string;
  age: number;
  gender: string;
  responses: string;
  questionsAsked: number;
  createdAt: Date;
}

async function ensureTable(conn: PoolConnection) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS diagnosis_results (
      id              VARCHAR(36)  PRIMARY KEY,
      name            VARCHAR(100) NOT NULL,
      age             INT          NOT NULL,
      gender          VARCHAR(20)  NOT NULL,
      responses       TEXT         NOT NULL,
      questions_asked INT          NOT NULL,
      created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function saveDiagnosisResult(data: {
  name: string;
  age: number;
  gender: string;
  responses: string;
  questionsAsked: number;
}): Promise<string> {
  const id = crypto.randomUUID();
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTable(conn);
    await conn.query(
      `INSERT INTO diagnosis_results (id, name, age, gender, responses, questions_asked)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.age, data.gender, data.responses, data.questionsAsked]
    );
    return id;
  } finally {
    if (conn) conn.release();
  }
}

export async function getDiagnosisResult(id: string): Promise<SavedDiagnosisResult | null> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTable(conn);
    const rows = await conn.query(
      `SELECT id, name, age, gender, responses, questions_asked, created_at
       FROM diagnosis_results WHERE id = ?`,
      [id]
    );
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      responses: row.responses,
      questionsAsked: row.questions_asked,
      createdAt: new Date(row.created_at),
    };
  } finally {
    if (conn) conn.release();
  }
}
