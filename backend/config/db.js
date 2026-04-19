// require('dotenv').config();
// const mysql = require('mysql2'); // Ensure you are using mysql2 for SSL support

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,           // Changed from 'localhost'
//     user: process.env.DB_USER,           // Changed from 'root'
//     password: process.env.DB_PASSWORD,   // Your TiDB Password
//     database: process.env.DB_NAME,       // Usually 'test'
//     port: process.env.DB_PORT || 4000,   // Changed from 3306 to 4000
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     // CRITICAL: Added this for Cloud Security
//     ssl: {
//         rejectUnauthorized: true
//     }
// });

// module.exports = pool.promise();

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true
    }
});

module.exports = pool.promise();