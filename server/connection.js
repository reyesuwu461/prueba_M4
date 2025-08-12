import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();  // Load variables from .env

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 10,        // Maximum number of active connections at the same time
    waitForConnections: true,   // If limit is reached, new requests wait their turn
    queueLimit: 0               // Maximum number of queued requests (0 = no limit)
});

async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful');
        connection.release();
    } catch (error) {
        console.error('❌ Error connecting to database:', error.message);
    }
}