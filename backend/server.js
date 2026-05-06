const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 👉 UPDATE 2: Made this line bulletproof so it always finds the folder!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const businessRoutes = require('./routes/businesses');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activity'); 

// Use Routes
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/services', require('./routes/services'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/activity', activityRoutes);

// Define a simple root route
app.get('/', (req, res) => {
    res.send('LocaBusin API is running...');
});

const PORT = 5000; // Back to a simple, fixed port

app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
});