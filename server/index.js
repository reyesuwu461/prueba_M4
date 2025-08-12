import cors from "cors";
import express from "express";
import { pool } from "./conexion_db.js"; // Asegúrate de que este import sea correcto

const app = express();
app.use(cors());
app.use(express.json());

// CRUD for transactions
app.get('/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.id_transaction,
                t.transaction_code,
                t.transaction_datetime,
                t.transaction_amount,
                t.paid_amount,
                t.id_bill,
                t.id_platform,
                t.id_status,
                t.id_type,
                b.bill_number,
                c.client_name AS client
            FROM transactions t
            LEFT JOIN bills b ON t.id_bill = b.id_bill
            LEFT JOIN clients c ON b.id_client = c.id_client
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.get('/transactions/:id_transaction', async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                t.id_transaction,
                t.transaction_code,
                t.transaction_datetime,
                t.transaction_amount,
                t.paid_amount,
                t.id_bill,
                t.id_platform,
                t.id_status,
                t.id_type,
                b.bill_number,
                c.client_name AS client
            FROM transactions t
            LEFT JOIN bills b ON t.id_bill = b.id_bill
            LEFT JOIN clients c ON b.id_client = c.id_client
            WHERE t.id_transaction = ?
        `, [id_transaction]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.post('/transactions', async (req, res) => {
    try {
        const {
            transaction_code,
            transaction_datetime,
            transaction_amount,
            paid_amount,
            id_bill,
            id_platform,
            id_status,
            id_type
        } = req.body;
        const query = `
            INSERT INTO transactions 
            (transaction_code, transaction_datetime, transaction_amount, paid_amount, id_bill, id_platform, id_status, id_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            transaction_code,
            transaction_datetime,
            transaction_amount,
            paid_amount,
            id_bill,
            id_platform,
            id_status,
            id_type
        ];
        const [result] = await pool.query(query, values);
        res.status(201).json({
            message: "Transaction created successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.put('/transactions/:id_transaction', async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const {
            transaction_code,
            transaction_datetime,
            transaction_amount,
            paid_amount,
            id_bill,
            id_platform,
            id_status,
            id_type
        } = req.body;
        const query = `
            UPDATE transactions SET 
                transaction_code = ?,
                transaction_datetime = ?,
                transaction_amount = ?,
                paid_amount = ?,
                id_bill = ?,
                id_platform = ?,
                id_status = ?,
                id_type = ?
            WHERE id_transaction = ?
        `;
        const values = [
            transaction_code,
            transaction_datetime,
            transaction_amount,
            paid_amount,
            id_bill,
            id_platform,
            id_status,
            id_type,
            id_transaction
        ];
        const [result] = await pool.query(query, values);
        if (result.affectedRows != 0) {
            return res.json({ message: "Transaction updated" });
        }
        res.status(404).json({ message: "Transaction not found" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.delete('/transactions/:id_transaction', async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const query = `
            DELETE FROM transactions WHERE id_transaction = ?
        `;
        const values = [id_transaction];
        const [result] = await pool.query(query, values);
        if (result.affectedRows != 0) {
            return res.json({ message: "Transaction deleted" });
        }
        res.status(404).json({ message: "Transaction not found" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// Get all bills for a client
app.get('/bills/client/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                b.id_bill,
                b.bill_number,
                b.billing_period,
                b.billed_amount,
                b.created_at
            FROM bills b
            WHERE b.id_client = ?
        `, [id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// Get all transactions for a bill
app.get('/transactions/bill/:id_bill', async (req, res) => {
    try {
        const { id_bill } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                t.id_transaction,
                t.transaction_code,
                t.transaction_datetime,
                t.transaction_amount,
                t.paid_amount,
                t.id_platform,
                t.id_status,
                t.id_type
            FROM transactions t
            WHERE t.id_bill = ?
        `, [id_bill]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// CRUD for clients
app.get('/clients', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id_client,
                identification_number,
                client_name,
                address,
                phone,
                email,
                registered_at
            FROM clients
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.get('/clients/:id_client', async (req, res) => {
    try {
        const { id_client } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                id_client,
                identification_number,
                client_name,
                address,
                phone,
                email,
                registered_at
            FROM clients
            WHERE id_client = ?
        `, [id_client]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.post('/clients', async (req, res) => {
    try {
        const {
            identification_number,
            client_name,
            address,
            phone,
            email
        } = req.body;
        const query = `
            INSERT INTO clients 
            (identification_number, client_name, address, phone, email)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            identification_number,
            client_name,
            address,
            phone,
            email
        ];
        const [result] = await pool.query(query, values);
        res.status(201).json({
            message: "Client created successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.put('/clients/:id_client', async (req, res) => {
    try {
        const { id_client } = req.params;
        const {
            identification_number,
            client_name,
            address,
            phone,
            email
        } = req.body;
        const query = `
            UPDATE clients SET 
                identification_number = ?,
                client_name = ?,
                address = ?,
                phone = ?,
                email = ?
            WHERE id_client = ?
        `;
        const values = [
            identification_number,
            client_name,
            address,
            phone,
            email,
            id_client
        ];
        const [result] = await pool.query(query, values);
        if (result.affectedRows != 0) {
            return res.json({ message: "Client updated" });
        }
        res.status(404).json({ message: "Client not found" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.delete('/clients/:id_client', async (req, res) => {
    try {
        const { id_client } = req.params;
        const query = `
            DELETE FROM clients WHERE id_client = ?
        `;
        const values = [id_client];
        const [result] = await pool.query(query, values);
        if (result.affectedRows != 0) {
            return res.json({ message: "Client deleted" });
        }
        res.status(404).json({ message: "Client not found" });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});