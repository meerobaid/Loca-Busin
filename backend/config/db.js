const mysql = require('mysql2');

// Create a connection pool. This is more efficient than creating a single connection.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Default user for XAMPP/MySQL
    password: 'obaidashraf', // Default password for XAMPP/MySQL is empty
    database: 'locabusin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the promise-based pool
module.exports = pool.promise();