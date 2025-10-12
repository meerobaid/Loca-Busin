const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database connection
const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware'); 

// @route   GET api/businesses
// @desc    Get all businesses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM businesses ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/businesses
// @desc    Create a new business
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    const { name, category, address, phone, image, description, capacity } = req.body;

    try {
        if (!name || !category) {
            return res.status(400).json({ msg: 'Please provide a name and category' });
        }

        const sql = 'INSERT INTO businesses (name, category, address, phone, image, description, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [name, category, address || null, phone || null, image || null, description || null, capacity || 10]);

        res.status(201).json({ msg: 'Business created successfully', businessId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ... The GET and POST routes are already here ...

// @route   PUT api/businesses/:id
// @desc    Update a business
// @access  Private (Admin)

router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    const { name, category, address, phone, image, description, capacity } = req.body;
    const businessId = req.params.id;

    try {
        const sql = 'UPDATE businesses SET name = ?, category = ?, address = ?, phone = ?, image = ?, description = ?, capacity = ? WHERE id = ?';
        const [result] = await db.execute(sql, [name, category, address, phone, image, description, capacity, businessId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Business not found' });
        }
        res.json({ msg: 'Business updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE api/businesses/:id
// @desc    Delete a business
// @access  Private (Admin)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    const businessId = req.params.id;

    try {
        const sql = 'DELETE FROM businesses WHERE id = ?';
        const [result] = await db.execute(sql, [businessId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Business not found' });
        }

        res.json({ msg: 'Business deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/businesses/:id
// @desc    Get a single business by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Business not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;