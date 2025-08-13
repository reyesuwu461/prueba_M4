/* Loads clients into the database */
import fs from 'fs'; // Allows reading files
import path from 'path'; // Shows the current path
import { fileURLToPath } from 'url'; // Needed to get __dirname in ES modules
import csv from 'csv-parser';
import { pool } from "../connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadClientsToDatabase() {
    const filePath = path.join(__dirname, '..', 'data', '01_clients.csv');
    console.log('File path:', filePath); 
    const clients = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .on('error', (err) => {
                console.error('❌ Error reading the clients CSV file:', err.message);
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
                    console.log('⚠️ No valid clients found in the CSV file to insert.');
                    return resolve();
                }

                try {
                    const sql = 'INSERT INTO clients (identification_numero, client_name, address, phone, email) VALUES ?';
                    const [result] = await pool.query(sql, [clients]);

                    console.log(`✅ Inserted ${result.affectedRows} clients.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error inserting clients:', error.message);
                    console.error('--> Problematic data (first row):', clients[0]);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error processing the clients CSV file:', err.message);
                reject(err);
            });
    });
}
