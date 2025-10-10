const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { business_id, booking_date } = req.body;

    try {
        // Add a check to ensure req.user and req.user.id exist
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Authorization error, user ID not found in token' });
        }
        const user_id = req.user.id; // Get user ID from the middleware

        // Simple validation
        if (!business_id || !booking_date) {
            return res.status(400).json({ msg: 'Please provide a business ID and a booking date' });
        }

        const sql = 'INSERT INTO bookings (user_id, business_id, booking_date) VALUES (?, ?, ?)';
        const [result] = await db.execute(sql, [user_id, business_id, booking_date]);

        res.status(201).json({ msg: 'Booking created successfully', bookingId: result.insertId });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/mybookings
// @desc    Get all bookings for the logged-in user
// @access  Private
router.get('/mybookings', authMiddleware, async (req, res) => {
    console.log('THE USER OBJECT IS:', req.user);
    try {
        const sql = `
            SELECT 
                b.booking_id, 
                b.booking_date, 
                b.status, 
                biz.name AS business_name 
            FROM bookings AS b
            JOIN businesses AS biz ON b.business_id = biz.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `;

        const [bookings] = await db.execute(sql, [req.user.id]);

        res.json(bookings);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ... after your GET /mybookings route ...

// @route   DELETE api/bookings/:id
// @desc    Delete (cancel) a booking
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        // Security check: Make sure the booking exists and belongs to the user
        const findSql = 'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?';
        const [rows] = await db.execute(findSql, [bookingId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Booking not found or you are not authorized to delete it' });
        }

        // If the check passes, delete the booking
        const deleteSql = 'DELETE FROM bookings WHERE booking_id = ?';
        await db.execute(deleteSql, [bookingId]);

        res.json({ msg: 'Booking cancelled successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;