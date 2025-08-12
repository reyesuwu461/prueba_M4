/* Loads bills into the database */
import fs from 'fs'; // Allows reading files
import path from 'path'; // Shows the current path
import csv from 'csv-parser';
import { pool } from "../connection_db.js";


export async function loadBillsToDatabase() {

    const filePath = path.resolve('server/data/03_bills.csv');
    const bills = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                bills.push([
                    row.id_bill,
                    row.client_id,
                    row.amount,
                    row.date_issued,
                    row.status
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO bills (id_bill, client_id, amount, date_issued, status) VALUES ?';
                    const [result] = await pool.query(sql, [bills]);

                    console.log(`✅ Inserted ${result.affectedRows} bills.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error inserting bills:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error reading bills CSV file:', err.message);
                reject(err);
            });
    });
}