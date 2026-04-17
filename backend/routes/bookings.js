const express = require('express');
const router = express.Router();
const db = require('../config/db');
// We only need authMiddleware since it is what you are using in other routes
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    // 👉 Get the new 'quantity' field from the request body
    const { business_id, booking_date, quantity } = req.body;
    const user_id = req.user.id;

    try {
        if (!business_id || !booking_date) {
            return res.status(400).json({ msg: 'Please provide a business ID and a booking date' });
        }

        // 👉 Updated SQL query and parameters
        const sql = 'INSERT INTO bookings (user_id, business_id, booking_date, quantity) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [user_id, business_id, booking_date, quantity || 1]);

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


// @route   GET api/bookings/my-bookings
// @desc    Get all bookings for businesses owned by the logged-in owner
// @access  Private (Owner)
router.get('/my-bookings', authMiddleware, async (req, res) => {
    try {
        const ownerId = req.user.id;

        // This SQL query joins tables to get the Customer Name and Business Name
        const sql = `
            SELECT 
                b.booking_id AS id, 
                b.booking_date, 
                IFNULL(b.status,'pending') AS status,
                b.quantity,
                u.name AS customer_name, 
                biz.name AS business_name
            FROM bookings b
            JOIN businesses biz ON b.business_id = biz.id
            JOIN users u ON b.user_id = u.id
            WHERE biz.owner_id = ?
            ORDER BY b.booking_date DESC
        `;

        const [rows] = await db.execute(sql, [ownerId]);
        console.log('Found ${rows.length} bookings for owner ID: ${ownerId}');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching owner bookings:', err.message);
        res.status(500).send('Server Error');
    }
});



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

// @route   GET api/bookings/all 
// @desc    Get ALL bookings for the admin panel
// @access  Private/Admin
router.get('/all', authMiddleware, async (req, res) => {
    try {
        // 1. Bulletproof Security Check: Ask the database directly if this user is an admin
        const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
        
        if (userCheck.length === 0 || userCheck[0].role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        // 2. The SQL Query: Join Bookings, Users, and Businesses
        const query = `
            SELECT 
                b.booking_id, 
                b.booking_date, 
                b.status, 
                b.quantity,
                u.name AS user_name, 
                u.email AS user_email,
                bus.name AS business_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN businesses bus ON b.business_id = bus.id
            ORDER BY b.booking_date DESC
        `;

        const [allBookings] = await db.execute(query);
        
        // 3. Send the data back to the frontend
        res.json(allBookings);

    } catch (err) {
        console.error('Error fetching all bookings:', err.message);
        res.status(500).send('Server Error');
    }
});

// Update booking status
// @route   PUT api/businesses/:id
// @desc    Update a business
// @access  Private (Owner or Admin)
router.put('/:id', authMiddleware, async (req, res) => {
    const { name, category, description } = req.body;

    try {
        // 1. First, check if the business exists and who owns it
        const [business] = await db.execute('SELECT owner_id FROM businesses WHERE id = ?', [req.params.id]);

        if (business.length === 0) return res.status(404).json({ msg: 'Business not found' });

        // 2. Security Check: Only allow if user is an Admin OR the actual Owner
        const [user] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
        const userRole = user[0].role;

        if (userRole !== 'admin' && business[0].owner_id !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. You do not own this business.' });
        }

        // 3. Perform the update
        await db.execute(
            'UPDATE businesses SET name = ?, category = ?, description = ? WHERE id = ?',
            [name, category, description, req.params.id]
        );

        res.json({ msg: 'Business updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;