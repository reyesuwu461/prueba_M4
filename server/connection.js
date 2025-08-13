// server/connection.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure that dotenv reads the .env file from the project root
// __dirname refers to the 'server' folder, so we go up one level ('..')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });


// Create a connection pool to the database.
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // Esta línea es crucial
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Message to verify that the variables were loaded
console.log(`✅ Connecting to database: '${process.env.DB_NAME}' at '${process.env.DB_HOST}'`);

// Function to test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful.');
        connection.release(); // Return the connection to the pool
    } catch (error) {
        // If there is an error, show it clearly
        console.error('❌ Fatal error connecting to the database:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`Error: The database '${process.env.DB_NAME}' does not exist.`);
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error(`Error: Access denied for user '${process.env.DB_USER}'. Check your credentials.`);
        }
        // Close the process if it cannot connect, since nothing else will work.
        process.exit(1); 
    }
}

// Test the connection when starting the application
testConnection();
