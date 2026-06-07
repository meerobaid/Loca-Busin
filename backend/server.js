// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // 👉 UPDATE 2: Made this line bulletproof so it always finds the folder!
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Import Routes
// const businessRoutes = require('./routes/businesses');
// const userRoutes = require('./routes/users');
// const activityRoutes = require('./routes/activity'); 
// const bookingRoutes = require('./routes/bookings');
// const authRoutes = require('./routes/auth');

// // Use Routes
// app.use('/api/businesses', businessRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/bookings', require('./routes/bookings'));
// app.use('/api/services', require('./routes/services'));
// app.use('/api/reviews', require('./routes/reviews'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/activity', activityRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/auth', authRoutes);
// // app.use('/api/activity', require('./routes/activity'));


// // Define a simple root route
// app.get('/', (req, res) => {
//     res.send('LocaBusin API is running...');
// });

// const PORT = 5000; // Back to a simple, fixed port

// app.listen(PORT, () => {
//     console.log(`Server is running locally on http://localhost:${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// ==========================================
// --- Global Middlewares ---
// ==========================================
app.use(cors());
app.use(express.json());

// Serve uploaded static files assets cleanly across the app port bridge
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// --- Import Routers Pipeline ---
// ==========================================
const businessRoutes = require('./routes/businesses');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

// ==========================================
// --- Route Registrations Routing Map ---
// ==========================================
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// ❌ The old legacy activity analytics tracking routes have been completely removed from here

// ==========================================
// --- Base Diagnostics & Activation ---
// ==========================================
app.get('/', (req, res) => {
    res.send('LocaBusin API is running smoothly...');
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` 🚀 LocaBusin Engine Connected Successfully!`);
    console.log(` 🌐 API Base: http://localhost:${PORT}/api`);
    console.log(`===================================================`);
});