/* Loads clients into the database */
import fs from 'fs'; // Permite leer archivos
import path from 'path'; // Muestra la ruta actual
import { fileURLToPath } from 'url'; // Necesario para obtener __dirname en módulos ES
import csv from 'csv-parser';
import { pool } from "../connection.js";

// Obtenemos la ruta del directorio actual (__dirname) en un módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadClientsToDatabase() {
    const filePath = path.join(__dirname, '..', 'data', '01_clients.csv');
    console.log('Ruta del archivo:', filePath); // Depuración
    const clients = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .on('error', (err) => {
                console.error('❌ Error al leer el archivo CSV de clientes:', err.message);
                reject(err);
            })
           
            .pipe(csv({
                mapHeaders: ({ header, index }) => {
                    const headers = [
                        'identification_numero',
                        'client_name',
                        'address',
                        'phone',
                        'email'
                    ];
                    return headers[index];
                }
            }))
   

            .on("data", (row) => {
                if (row.identification_numero) {
                    clients.push([
                        row.identification_numero,
                        row.client_name,
                        row.address,
                        row.phone,
                        row.email,
                    ]);
                }
            })
            .on('end', async () => {
                if (clients.length === 0) {
                    console.log('⚠️ No se encontraron clientes válidos en el archivo CSV para insertar.');
                    return resolve();
                }

                try {
                    const sql = 'INSERT INTO clients (identification_numero, client_name, address, phone, email) VALUES ?';
                    const [result] = await pool.query(sql, [clients]);

                    console.log(`✅ Se insertaron ${result.affectedRows} clientes.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error al insertar clientes:', error.message);
                    // Opcional: Mostrar la primera fila que pudo causar el error
                    console.error('--> Datos problemáticos (primera fila):', clients[0]);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error al procesar el archivo CSV de clientes:', err.message);
                reject(err);
            });
    });
}
