const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // ssl: { rejectUnauthorized: false } // Descomentar si usas un host remoto con SSL
});

pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de PostgreSQL:', err);
    process.exit(-1);
});

console.log("Conexión a PostgreSQL establecida.");

module.exports = {
    query: (text, params) => pool.query(text, params),
};