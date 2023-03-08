const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM my_table');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
