const mysql = require('mysql2');
require('dotenv').config(); // This uses the library from node_modules

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // It reads 'obaidashraf' from your hidden .env
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();