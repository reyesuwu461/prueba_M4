/* Loads transactions into the database */
import fs from 'fs'; // Allows reading files
import path from 'path'; // Shows the current path
import csv from 'csv-parser';
import { pool } from "../connection.js";


export async function loadTransactionsToDatabase() {

    const filePath = path.resolve('server/data/02_transactions.csv');
    const transactions = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                transactions.push([
                    row.id_transactions,
                    row.identification_numero,
                    row.client_name,
                    row.address,
                    row.phone,
                    row.email,
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO transactions (id_transaction, amount, type, date, client_id) VALUES ?';
                    const [result] = await pool.query(sql, [transactions]);

                    console.log(`✅ Inserted ${result.affectedRows} transactions.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error inserting transactions:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error reading transactions CSV file:', err.message);
                reject(err);
            });
    });
}
