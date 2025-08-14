// server/connection.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aseguramos que dotenv lea el archivo .env desde la raíz del proyecto
// __dirname se refiere a la carpeta 'server', así que subimos un nivel ('..')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });


// Crea un "pool" de conexiones a la base de datos.
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // Esta línea es crucial
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mensaje para verificar que las variables se cargaron
console.log(`✅ Conectando a la base de datos: '${process.env.DB_NAME}' en '${process.env.DB_HOST}'`);

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos exitosa.');
        connection.release(); // Devuelve la conexión al pool
    } catch (error) {
        // Si hay un error, lo mostramos de forma clara
        console.error('❌ Error fatal al conectar con la base de datos:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`Error: La base de datos '${process.env.DB_NAME}' no existe.`);
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error(`Error: Acceso denegado para el usuario '${process.env.DB_USER}'. Revisa tus credenciales.`);
        }
        // Cierra el proceso si no se puede conectar, ya que nada más funcionará.
        process.exit(1); 
    }
}

// Probamos la conexión al iniciar la aplicación
testConnection();
