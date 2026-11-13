import mariadb, { type ConnectionConfig, type PoolConnection } from "mariadb";
import type { Symptom } from "./types";

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "eyedx",
  // servername diteruskan ke tls.connect() tapi absen dari tipe ssl driver
  ssl: process.env.DB_SSL === "true"
    ? ({ rejectUnauthorized: false, servername: process.env.DB_HOST } as ConnectionConfig["ssl"])
    : false,
  connectionLimit: 1,
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
  userId?: string;
  // JSON dari { responses, results } pada saat disimpan — null untuk rekaman lama
  // sebelum kolom ini ada (lihat T3 di BLUEPRINT.md), yang berarti harus dihitung ulang
  resultsSnapshot?: string | null;
}

export interface User {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'expert' | 'admin';
  createdAt: Date;
  // null untuk akun bawaan seed yang dibuat sebelum kolom ini ada
  age: number | null;
  gender: string | null;
}

export interface Illness {
  no: number;
  kodePenyakit: string;
  namaPenyakit: string;
}

export interface ExpertSystemEntry {
  no: number;
  kodeGejala: string;
  cf: Record<string, number | null>;
}

async function ensureTables(conn: PoolConnection) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id              VARCHAR(36)  PRIMARY KEY,
      username        VARCHAR(50)  NOT NULL UNIQUE,
      name            VARCHAR(100) NOT NULL,
      password_hash   VARCHAR(255) NOT NULL,
      role            ENUM('user', 'expert', 'admin') NOT NULL DEFAULT 'user',
      created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      age             INT          NULL,
      gender          VARCHAR(20)  NULL
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS symptoms (
      no              INT          PRIMARY KEY,
      kode_gejala     VARCHAR(10)  NOT NULL UNIQUE,
      nama_gejala     VARCHAR(255) NOT NULL,
      symptoms_name   VARCHAR(255)
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS illnesses (
      no              INT          PRIMARY KEY,
      kode_penyakit   VARCHAR(10)  NOT NULL UNIQUE,
      nama_penyakit   VARCHAR(255) NOT NULL
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS expert_system (
      no              INT          PRIMARY KEY,
      kode_gejala     VARCHAR(10)  NOT NULL UNIQUE,
      cf_p1           DECIMAL(3,2),
      cf_p2           DECIMAL(3,2),
      cf_p3           DECIMAL(3,2),
      cf_p4           DECIMAL(3,2),
      cf_p5           DECIMAL(3,2),
      cf_p6           DECIMAL(3,2)
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS diagnosis_results (
      id                VARCHAR(36)  PRIMARY KEY,
      name              VARCHAR(100) NOT NULL,
      age               INT          NOT NULL,
      gender            VARCHAR(20)  NOT NULL,
      responses         TEXT         NOT NULL,
      questions_asked   INT          NOT NULL,
      created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      user_id           VARCHAR(36),
      results_snapshot  LONGTEXT     NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // migrasi untuk database lama yang tabelnya sudah ada sebelum kolom ini (T3)
  await conn.query(`
    ALTER TABLE diagnosis_results
      ADD COLUMN IF NOT EXISTS results_snapshot LONGTEXT NULL
  `);
}

export async function saveDiagnosisResult(data: {
  name: string;
  age: number;
  gender: string;
  responses: string;
  questionsAsked: number;
  resultsSnapshot?: string;
}, userId?: string): Promise<string> {
  const id = crypto.randomUUID();
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(
      `INSERT INTO diagnosis_results (id, name, age, gender, responses, questions_asked, user_id, results_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.age, data.gender, data.responses, data.questionsAsked, userId || null, data.resultsSnapshot || null]
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
    await ensureTables(conn);
    const rows = await conn.query(
      `SELECT id, name, age, gender, responses, questions_asked, created_at, user_id, results_snapshot
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
      userId: row.user_id,
      resultsSnapshot: row.results_snapshot,
    };
  } finally {
    if (conn) conn.release();
  }
}

export async function createUser(data: {
  username: string;
  name: string;
  age: number;
  gender: string;
  passwordHash: string;
  role?: 'user' | 'expert' | 'admin';
}): Promise<string> {
  const id = crypto.randomUUID();
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(
      `INSERT INTO users (id, username, name, age, gender, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.username, data.name, data.age, data.gender, data.passwordHash, data.role || 'user']
    );
    return id;
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const rows = await conn.query(
      `SELECT id, username, name, age, gender, password_hash, role, created_at
       FROM users WHERE username = ?`,
      [username]
    );
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      name: row.name,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: new Date(row.created_at),
      age: row.age,
      gender: row.gender,
    };
  } finally {
    if (conn) conn.release();
  }
}

export type UserSummary = Omit<User, 'passwordHash'>;

// password_hash sengaja tidak diambil supaya tidak pernah terkirim ke klien
export async function getUsers(): Promise<UserSummary[]> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const rows = await conn.query(
      `SELECT id, username, name, age, gender, role, created_at
       FROM users ORDER BY created_at DESC`
    );
    return Array.isArray(rows) ? rows.map(row => ({
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role,
      createdAt: new Date(row.created_at),
      age: row.age,
      gender: row.gender,
    })) : [];
  } finally {
    if (conn) conn.release();
  }
}

export async function updateUser(id: string, data: {
  name?: string;
  age?: number;
  gender?: string;
  passwordHash?: string;
  role?: 'user' | 'expert' | 'admin';
}): Promise<void> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(
      `UPDATE users
       SET name = COALESCE(?, name),
           age = COALESCE(?, age),
           gender = COALESCE(?, gender),
           password_hash = COALESCE(?, password_hash),
           role = COALESCE(?, role)
       WHERE id = ?`,
      [data.name, data.age, data.gender, data.passwordHash, data.role, id]
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserById(id: string): Promise<User | null> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const rows = await conn.query(
      `SELECT id, username, name, age, gender, password_hash, role, created_at
       FROM users WHERE id = ?`,
      [id]
    );
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      name: row.name,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: new Date(row.created_at),
      age: row.age,
      gender: row.gender,
    };
  } finally {
    if (conn) conn.release();
  }
}

export async function getSymptoms(): Promise<Symptom[]> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const rows = await conn.query(
      `SELECT no, kode_gejala, nama_gejala, symptoms_name
       FROM symptoms ORDER BY no`
    );
    return Array.isArray(rows) ? rows.map(row => ({
      no: row.no,
      kodeGejala: row.kode_gejala,
      namaGejala: row.nama_gejala,
      symptomsName: row.symptoms_name,
    })) : [];
  } finally {
    if (conn) conn.release();
  }
}

export async function getIllnesses(): Promise<Illness[]> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const rows = await conn.query(
      `SELECT no, kode_penyakit, nama_penyakit
       FROM illnesses ORDER BY no`
    );
    return Array.isArray(rows) ? rows.map(row => ({
      no: row.no,
      kodePenyakit: row.kode_penyakit,
      namaPenyakit: row.nama_penyakit,
    })) : [];
  } finally {
    if (conn) conn.release();
  }
}

export async function getExpertSystem(): Promise<ExpertSystemEntry[]> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const rows = await conn.query(
      `SELECT no, kode_gejala, cf_p1, cf_p2, cf_p3, cf_p4, cf_p5, cf_p6
       FROM expert_system ORDER BY no`
    );
    return Array.isArray(rows) ? rows.map(row => ({
      no: row.no,
      kodeGejala: row.kode_gejala,
      cf: {
        P1: row.cf_p1,
        P2: row.cf_p2,
        P3: row.cf_p3,
        P4: row.cf_p4,
        P5: row.cf_p5,
        P6: row.cf_p6,
      },
    })) : [];
  } finally {
    if (conn) conn.release();
  }
}

export async function getDiagnosisHistory(userId: string, limit?: number): Promise<SavedDiagnosisResult[]> {
  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const query = limit
      ? `SELECT id, name, age, gender, responses, questions_asked, created_at, user_id
         FROM diagnosis_results WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
      : `SELECT id, name, age, gender, responses, questions_asked, created_at, user_id
         FROM diagnosis_results WHERE user_id = ? ORDER BY created_at DESC`;
    const rows = await conn.query(query, limit ? [userId, limit] : [userId]);
    return Array.isArray(rows) ? rows.map(row => ({
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      responses: row.responses,
      questionsAsked: row.questions_asked,
      createdAt: new Date(row.created_at),
      userId: row.user_id,
    })) : [];
  } finally {
    if (conn) conn.release();
  }
}

// CRUD operations for Symptoms
export async function createSymptom(data: Omit<Symptom, 'no'>): Promise<number> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    
    // Get next available no
    const rows = await conn.query(`SELECT MAX(no) as maxNo FROM symptoms`);
    const nextNo = (rows[0]?.maxNo || 0) + 1;
    
    await conn.query(
      `INSERT INTO symptoms (no, kode_gejala, nama_gejala, symptoms_name)
       VALUES (?, ?, ?, ?)`,
      [nextNo, data.kodeGejala, data.namaGejala, data.symptomsName]
    );
    return nextNo;
  } finally {
    if (conn) conn.release();
  }
}

export async function updateSymptom(no: number, data: Partial<Omit<Symptom, 'no'>>): Promise<void> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(
      `UPDATE symptoms 
       SET kode_gejala = COALESCE(?, kode_gejala),
           nama_gejala = COALESCE(?, nama_gejala),
           symptoms_name = COALESCE(?, symptoms_name)
       WHERE no = ?`,
      [data.kodeGejala, data.namaGejala, data.symptomsName, no]
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function deleteSymptom(no: number): Promise<void> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(`DELETE FROM symptoms WHERE no = ?`, [no]);
  } finally {
    if (conn) conn.release();
  }
}

// CRUD operations for Illnesses
export async function createIllness(data: Omit<Illness, 'no'>): Promise<number> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    
    // Get next available no
    const rows = await conn.query(`SELECT MAX(no) as maxNo FROM illnesses`);
    const nextNo = (rows[0]?.maxNo || 0) + 1;
    
    await conn.query(
      `INSERT INTO illnesses (no, kode_penyakit, nama_penyakit)
       VALUES (?, ?, ?)`,
      [nextNo, data.kodePenyakit, data.namaPenyakit]
    );
    return nextNo;
  } finally {
    if (conn) conn.release();
  }
}

export async function updateIllness(no: number, data: Partial<Omit<Illness, 'no'>>): Promise<void> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(
      `UPDATE illnesses 
       SET kode_penyakit = COALESCE(?, kode_penyakit),
           nama_penyakit = COALESCE(?, nama_penyakit)
       WHERE no = ?`,
      [data.kodePenyakit, data.namaPenyakit, no]
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function deleteIllness(no: number): Promise<void> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(`DELETE FROM illnesses WHERE no = ?`, [no]);
  } finally {
    if (conn) conn.release();
  }
}

// CRUD operations for Expert System
export async function createExpertSystemEntry(data: Omit<ExpertSystemEntry, 'no'>): Promise<number> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    
    // Get next available no
    const rows = await conn.query(`SELECT MAX(no) as maxNo FROM expert_system`);
    const nextNo = (rows[0]?.maxNo || 0) + 1;
    
    await conn.query(
      `INSERT INTO expert_system (no, kode_gejala, cf_p1, cf_p2, cf_p3, cf_p4, cf_p5, cf_p6)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextNo, data.kodeGejala, data.cf.P1, data.cf.P2, data.cf.P3, data.cf.P4, data.cf.P5, data.cf.P6]
    );
    return nextNo;
  } finally {
    if (conn) conn.release();
  }
}

export async function updateExpertSystemEntry(no: number, data: Partial<Omit<ExpertSystemEntry, 'no'>>): Promise<void> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.kodeGejala !== undefined) {
      updates.push('kode_gejala = ?');
      values.push(data.kodeGejala);
    }
    
    if (data.cf) {
      if (data.cf.P1 !== undefined) { updates.push('cf_p1 = ?'); values.push(data.cf.P1); }
      if (data.cf.P2 !== undefined) { updates.push('cf_p2 = ?'); values.push(data.cf.P2); }
      if (data.cf.P3 !== undefined) { updates.push('cf_p3 = ?'); values.push(data.cf.P3); }
      if (data.cf.P4 !== undefined) { updates.push('cf_p4 = ?'); values.push(data.cf.P4); }
      if (data.cf.P5 !== undefined) { updates.push('cf_p5 = ?'); values.push(data.cf.P5); }
      if (data.cf.P6 !== undefined) { updates.push('cf_p6 = ?'); values.push(data.cf.P6); }
    }
    
    if (updates.length > 0) {
      values.push(no);
      await conn.query(
        `UPDATE expert_system SET ${updates.join(', ')} WHERE no = ?`,
        values
      );
    }
  } finally {
    if (conn) conn.release();
  }
}

export async function deleteExpertSystemEntry(no: number): Promise<void> {
  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.query(`DELETE FROM expert_system WHERE no = ?`, [no]);
  } finally {
    if (conn) conn.release();
  }
}
