const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   GET /api/admin/stats
// @desc    Get key platform statistics
// @access  Private (Admin Only)
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        // Run multiple queries concurrently (at the same time)
        const [totalUsers] = await db.execute('SELECT COUNT(*) AS count FROM users');
        const [totalBusinesses] = await db.execute('SELECT COUNT(*) AS count FROM businesses');
        const [totalBookings] = await db.execute('SELECT COUNT(*) AS count FROM bookings');

        const stats = {
            totalUsers: totalUsers[0].count,
            totalBusinesses: totalBusinesses[0].count,
            totalBookings: totalBookings[0].count,
        };

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings for all users
// @access  Private (Admin Only)
router.get('/bookings', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.booking_id, 
                b.booking_date, 
                b.status, 
                b.quantity,
                biz.name AS business_name,
                u.name AS user_name 
            FROM bookings AS b
            JOIN businesses AS biz ON b.business_id = biz.id
            JOIN users AS u ON b.user_id = u.id
            ORDER BY b.booking_date DESC
        `;
        const [bookings] = await db.execute(sql);
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;