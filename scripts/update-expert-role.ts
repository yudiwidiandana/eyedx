import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mariadb, { type ConnectionConfig } from "mariadb";

async function updateUserRole() {
  let conn = null;

  try {
    console.log("Connecting to database...");
    conn = await mariadb.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "eyedx",
      // servername diteruskan ke tls.connect() tapi absen dari tipe ssl driver
      ssl: process.env.DB_SSL === "true"
        ? ({ rejectUnauthorized: false, servername: process.env.DB_HOST } as ConnectionConfig["ssl"])
        : false,
      connectTimeout: 10000,
    });
    console.log("Connected to database");

    await conn.query(
      `UPDATE users SET role = 'expert' WHERE username = 'expert'`
    );
    
    console.log("Updated expert user role successfully");
    
    const result = await conn.query(
      `SELECT username, name, role FROM users WHERE username = 'expert'`
    );
    
    console.log("Expert user details:", result[0]);
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

updateUserRole();
