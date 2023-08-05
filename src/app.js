import express from 'express';
import { pool } from './db.js';
import { PORT } from './config.js'
import cors from 'cors'


const app = express();
app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
    res.send('GET request to the homepage');
});

app.get('/ping', async (req, res) => {
    try {
        const result = await pool.query(`SELECT 'hello world' as RESULT`);
        console.log(result);
        res.status(200).send("Process Execute")
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Método para crear un nuevo usuario
app.post('/users', async (req, res) => {
    try {
        const { cedula, nombre, apellido } = req.body;
        const createdAt = new Date().toISOString();

        const results = await pool.execute(
            'INSERT INTO users (cedula, nombre, apellido, created_at) VALUES (?, ?, ?, ?)',
            [cedula, nombre, apellido, createdAt]
        );

        const userId = results.insertId;
        res.status(201).json({ message: 'Usuario creado exitosamente', userId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json(error);
    }
});

// Método para actualizar un usuario existente
app.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { cedula, nombre, apellido } = req.body;
        const updatedAt = new Date().toISOString();
        await pool.execute(
            'UPDATE users SET cedula = ?, nombre = ?, apellido = ?, updated_at = ? WHERE id = ?',
            [cedula, nombre, apellido, updatedAt, userId]
        );
        res.status(200).json({ id: userId, cedula, nombre, apellido, updated_at: updatedAt });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Método para eliminar un usuario
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Método para listar todos los usuarios
app.get('/users', async (req, res) => {
    try {
        const [results] = await pool.execute('SELECT * FROM users');
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const port = PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});