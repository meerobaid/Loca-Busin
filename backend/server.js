const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const businessRoutes = require('./routes/businesses');
const userRoutes = require('./routes/users');

// Use Routes
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', require('./routes/bookings'));

// Define a simple root route
app.get('/', (req, res) => {
    res.send('LocaBusin API is running...');
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});