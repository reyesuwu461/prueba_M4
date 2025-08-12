/* Loads clients into the database */
import fs from 'fs'; // Allows reading files
import path from 'path'; // Shows the current path
import csv from 'csv-parser';
import { pool } from "../connection_db.js"; 

export async function loadClientsToDatabase() {

    const filePath = path.resolve('server/data/01_clients.csv');
    const clients = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                clients.push([
                    row.id_client,
                    row.full_name.trim(),
                    row.identification,
                    row.email,
                    row.phone,
                    // Normalize the platform name to 'Daviplata' or 'Nequi'
                    row.plataform === 'Daviplata' ? 'Daviplata' : ' Nequi'     
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO clients (id_client, name, identification, email, phone) VALUES ?';
                    const [result] = await pool.query(sql, [clients]);

                    console.log(`✅Inserted ${result.affectedRows} clients.`);
                    resolve(); // Resolve the promise after insertion
                } catch (error) {
                    console.error('❌Error inserting clients:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌Error reading clients CSV file:', err.message);
                reject(err);
            });
    });
}