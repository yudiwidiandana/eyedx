import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import 'dotenv/config';
import mariadb from "mariadb";
import bcrypt from "bcryptjs";
import symptomsJson from "../app/table/symptoms.json";
import illnessesJson from "../app/table/illnesses.json";
import expertSystemJson from "../app/table/expertSystem.json";

async function seed() {
  let conn = null;

  try {
    console.log("Connecting to database...");
    conn = await mariadb.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "eyedx",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false, servername: process.env.DB_HOST } : false,
      connectTimeout: 10000,
    });
    console.log("Connected to database");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              VARCHAR(36)  PRIMARY KEY,
        username        VARCHAR(50)  NOT NULL UNIQUE,
        name            VARCHAR(100) NOT NULL,
        password_hash   VARCHAR(255) NOT NULL,
        role            ENUM('user', 'expert', 'admin') NOT NULL DEFAULT 'user',
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS symptoms (
        no              INT          PRIMARY KEY,
        kode_gejala     VARCHAR(10)  NOT NULL UNIQUE,
        nama_gejala     VARCHAR(255) NOT NULL,
        symptoms_name   VARCHAR(255)
      )
    `);
    console.log("Symptoms table created");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS illnesses (
        no              INT          PRIMARY KEY,
        kode_penyakit   VARCHAR(10)  NOT NULL UNIQUE,
        nama_penyakit   VARCHAR(255) NOT NULL
      )
    `);
    console.log("Illnesses table created");

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
    console.log("Expert system table created");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS diagnosis_results (
        id              VARCHAR(36)  PRIMARY KEY,
        name            VARCHAR(100) NOT NULL,
        age             INT          NOT NULL,
        gender          VARCHAR(20)  NOT NULL,
        responses       TEXT         NOT NULL,
        questions_asked INT          NOT NULL,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        user_id         VARCHAR(36),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log("Diagnosis results table created");

    const existingAdmin = await conn.query(
      `SELECT id FROM users WHERE username = ?`,
      ["admin"]
    );

    if (Array.isArray(existingAdmin) && existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash("password123", 10);
      const adminId = crypto.randomUUID();
      await conn.query(
        `INSERT INTO users (id, username, name, password_hash, role)
         VALUES (?, ?, ?, ?, ?)`,
        [adminId, "admin", "Administrator", passwordHash, "admin"]
      );
      console.log("Default admin user created (username: admin, password: password123)");
    } else {
      console.log("Admin user already exists, skipping");
    }

    const existingExpert = await conn.query(
      `SELECT id FROM users WHERE username = ?`,
      ["expert"]
    );

    if (Array.isArray(existingExpert) && existingExpert.length === 0) {
      const expertPasswordHash = await bcrypt.hash("password123", 10);
      const expertId = crypto.randomUUID();
      await conn.query(
        `INSERT INTO users (id, username, name, password_hash, role)
         VALUES (?, ?, ?, ?, ?)`,
        [expertId, "expert", "Expert User", expertPasswordHash, "expert"]
      );
      console.log("Default expert user created (username: expert, password: password123)");
    } else {
      console.log("Expert user already exists, skipping");
    }

    for (const symptom of symptomsJson.symptoms) {
      await conn.query(
        `INSERT INTO symptoms (no, kode_gejala, nama_gejala, symptoms_name)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         nama_gejala = VALUES(nama_gejala),
         symptoms_name = VALUES(symptoms_name)`,
        [symptom.no, symptom.kodeGejala, symptom.namaGejala, symptom.symptomsName]
      );
    }
    console.log(`Seeded ${symptomsJson.symptoms.length} symptoms`);

    for (const illness of illnessesJson.illnesses) {
      await conn.query(
        `INSERT INTO illnesses (no, kode_penyakit, nama_penyakit)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
         nama_penyakit = VALUES(nama_penyakit)`,
        [illness.no, illness.kodePenyakit, illness.namaPenyakit]
      );
    }
    console.log(`Seeded ${illnessesJson.illnesses.length} illnesses`);

    for (const entry of expertSystemJson.symptoms) {
      await conn.query(
        `INSERT INTO expert_system (no, kode_gejala, cf_p1, cf_p2, cf_p3, cf_p4, cf_p5, cf_p6)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         cf_p1 = VALUES(cf_p1),
         cf_p2 = VALUES(cf_p2),
         cf_p3 = VALUES(cf_p3),
         cf_p4 = VALUES(cf_p4),
         cf_p5 = VALUES(cf_p5),
         cf_p6 = VALUES(cf_p6)`,
        [
          entry.no,
          entry.kodeGejala,
          entry.cf.P1,
          entry.cf.P2,
          entry.cf.P3,
          entry.cf.P4,
          entry.cf.P5,
          entry.cf.P6,
        ]
      );
    }
    console.log(`Seeded ${expertSystemJson.symptoms.length} expert system entries`);

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

seed();
