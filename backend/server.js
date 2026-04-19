// NEW CODE (SERVER.JS)

const express = require('express');
const cors = require('cors');
const path = require('path'); // 👉 UPDATE 1: Added this line!

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 👉 UPDATE 2: Made this line bulletproof so it always finds the folder!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const businessRoutes = require('./routes/businesses');
const userRoutes = require('./routes/users');

// Use Routes
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/services', require('./routes/services'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// Define a simple root route
app.get('/', (req, res) => {
    res.send('LocaBusin API is running...');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});