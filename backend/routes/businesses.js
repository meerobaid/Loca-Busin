const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database connection

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
// @access  Private (we will make this admin-only later)
router.post('/', async (req, res) => {
    // We'll get the required fields first
    const { name, category } = req.body;

    // Then we'll get the optional fields, providing null as a default
    const address = req.body.address || null;
    const phone = req.body.phone || null;
    const image = req.body.image || null;
    const description = req.body.description || null;

    try {
        // Simple validation for required fields
        if (!name || !category) {
            return res.status(400).json({ msg: 'Please provide a name and category' });
        }

        const sql = 'INSERT INTO businesses (name, category, address, phone, image, description) VALUES (?, ?, ?, ?, ?, ?)';
        
        // This array now contains `null` for any missing optional values, which is safe.
        const [result] = await db.execute(sql, [name, category, address, phone, image, description]);

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
router.put('/:id', async (req, res) => {
    // Get the new data from the request body
    const { name, category, address, phone, image, description } = req.body;
    // Get the ID from the URL parameter
    const businessId = req.params.id;

    try {
        const sql = 'UPDATE businesses SET name = ?, category = ?, address = ?, phone = ?, image = ?, description = ? WHERE id = ?';

        const [result] = await db.execute(sql, [name, category, address, phone, image, description, businessId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Business not found or no changes made' });
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
router.delete('/:id', async (req, res) => {
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