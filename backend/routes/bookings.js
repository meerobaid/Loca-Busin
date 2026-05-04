const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/bookings
// @desc    Create a new booking with capacity check
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { business_id, booking_date, quantity } = req.body;

    try {
        // 1. Get Business Capacity
        const [business] = await db.execute('SELECT capacity FROM businesses WHERE id = ?', [business_id]);
        
        if (business.length === 0) return res.status(404).json({ msg: 'Business not found' });

        // 2. Get Total Already Booked for that date (excluding cancelled ones)
        // Note: status check is case-insensitive in most MySQL configs, but we use Pending/Confirmed
        const [existing] = await db.execute(
            'SELECT SUM(quantity) as total FROM bookings WHERE business_id = ? AND DATE(booking_date) = DATE(?) AND status NOT IN ("cancelled", "Cancelled")', 
            [business_id, booking_date]
        );

        const currentTotal = Number(existing[0].total) || 0;
        const maxCapacity = Number(business[0].capacity) || 10;
        const requestedQuantity = Number(quantity) || 1;

        console.log(`Debug: Capacity ${maxCapacity}, Booked ${currentTotal}, Requested ${requestedQuantity}`);

        // 3. Logic Check
        if (currentTotal + requestedQuantity > maxCapacity) {
            return res.status(400).json({ 
                msg: `Sorry, this date is full. Only ${maxCapacity - currentTotal} spots remaining.` 
            });
        }

        // 4. Create the booking
        const sql = 'INSERT INTO bookings (user_id, business_id, booking_date, quantity, status) VALUES (?, ?, ?, ?, "Pending")';
        await db.execute(sql, [req.user.id, business_id, booking_date, requestedQuantity]);

        res.status(201).json({ msg: 'Booking successful!' });
    } catch (err) {
        console.error('Booking Error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/bookings/:id/status
// @desc    Confirm or Cancel a booking (For Business Owners)
// @access  Private (Owner)
router.put('/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const bookingId = req.params.id; // Correctly pulls from URL

    try {
        const sql = 'UPDATE bookings SET status = ? WHERE booking_id = ?';
        await db.execute(sql, [status, bookingId]);
        
        res.json({ msg: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/mybookings
// @desc    Get all bookings for the logged-in user (Customer View)
router.get('/mybookings', authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.booking_id, 
                b.booking_date, 
                b.status, 
                b.quantity,
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
// @desc    Get all bookings for businesses owned by the logged-in owner (Owner View)
router.get('/my-bookings', authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.booking_id AS id, 
                b.booking_date, 
                b.status,
                b.quantity,
                u.name AS customer_name, 
                biz.name AS business_name
            FROM bookings b
            JOIN businesses biz ON b.business_id = biz.id
            JOIN users u ON b.user_id = u.id
            WHERE biz.owner_id = ?
            ORDER BY b.booking_date DESC
        `;
        const [rows] = await db.execute(sql, [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching owner bookings:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/bookings/:id
// @desc    Delete (cancel) a booking
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Booking not found' });

        await db.execute('DELETE FROM bookings WHERE booking_id = ?', [req.params.id]);
        res.json({ msg: 'Booking cancelled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/all 
// @desc    Get ALL bookings for the admin panel
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (userCheck.length === 0 || userCheck[0].role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

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
        res.json(allBookings);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;