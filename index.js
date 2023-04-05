const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const specs = require('./swaggerSpecs');

const app = express();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Добавьте эти строки перед app.get('/', async (req, res) => {...
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 *
 * /:
 *   get:
 *     summary: Получить список пользователей.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Список пользователей.
 */
app.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

/**
 * @swagger
 *
 * /create_users_table:
 *   get:
 *     summary: Создать таблицу пользователей и заполнить ее.
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Таблица создана и заполнена.
 *       500:
 *         description: Ошибка при создании таблицы.
 */
app.get('/create_users_table', async (req, res) => {
    try {
        const query = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
        await pool.query(query);
        // Заполнение таблицы тремя случайными записями
        for (let i = 0; i < 3; i++) {
            const email = `user${i}@example.com`;
            const password = `password${i}`;
            const insertQuery = `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
      `;
            await pool.query(insertQuery, [email, password]);
        }
        res.send('Таблица создана и заполнена');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при создании таблицы');
    }
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});