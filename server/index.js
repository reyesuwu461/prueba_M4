import cors from "cors";
import express from "express";
import { pool } from "./connection.js"; // Asegúrate de que este import sea correcto
import morgan from "morgan";

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// CRUD for clients

// GET all clients
app.get('/clients', async (req, res) => {
    try {
        // Uso de comillas invertidas para mayor seguridad en la consulta.
        const [rows] = await pool.query('SELECT * FROM `clients`');
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

// GET a single client by ID
app.get('/clients/:id_client', async (req, res) => {
    try {
        const { id_client } = req.params;
        // Uso de comillas invertidas en el nombre de la tabla y la columna.
        const [rows] = await pool.query('SELECT * FROM `clients` WHERE `id_client` = ?', [id_client]);
        
        if (rows.length <= 0) {
            return res.status(404).json({ message: "Client not found" });
        }
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

// CREATE a new client
app.post('/clients', async (req, res) => {
    try {
        const {
            identification_numero,
            client_name,
            address,
            phone,
            email
        } = req.body;
        
        // Se añaden comillas invertidas a los nombres de las columnas.
        const query = `
            INSERT INTO \`clients\` 
            (\`identification_numero\`, \`client_name\`, \`address\`, \`phone\`, \`email\`)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            identification_numero,
            client_name,
            address,
            phone,
            email
        ];
        
        await pool.query(query, values);
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

// UPDATE a client
app.put('/clients/:id_client', async (req, res) => {
    try {
        const { id_client } = req.params;
        const {
            identification_numero,
            client_name,
            address,
            phone,
            email
        } = req.body;

        // Uso de comillas invertidas para toda la consulta de actualización.
        const query = `
            UPDATE \`clients\` SET 
                \`identification_numero\`= ?,
                \`client_name\` = ?,
                \`address\` = ?,
                \`phone\` = ?,
                \`email\` = ?
            WHERE \`id_client\` = ?
        `;
        const values = [
            identification_numero,
            client_name,
            address,
            phone,
            email,
            id_client
        ];
        
        const [result] = await pool.query(query, values);
        
        if (result.affectedRows > 0) {
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

// DELETE a client
app.delete('/clients/:id_client', async (req, res) => {
    try {
        const { id_client } = req.params;
        // Uso de comillas invertidas en la consulta de eliminación.
        const query = 'DELETE FROM `clients` WHERE `id_client` = ?';
        const values = [id_client];
        
        const [result] = await pool.query(query, values);

        if (result.affectedRows > 0) {
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
