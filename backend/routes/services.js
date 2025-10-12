const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   POST /api/services
// @desc    Add a new service to a business
// @access  Private (Admin)
router.post('/', async (req, res) => {
    const { business_id, name, description, price, image } = req.body;

    try {
        if (!business_id || !name || !price) {
            return res.status(400).json({ msg: 'Please provide business ID, name, and price' });
        }

        const sql = 'INSERT INTO services (business_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [business_id, name, description || null, price, image || null]);

        res.status(201).json({ msg: 'Service added successfully', serviceId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/services/business/:business_id
// @desc    Get all services for a specific business
// @access  Public
router.get('/business/:business_id', async (req, res) => {
    try {
        const sql = 'SELECT * FROM services WHERE business_id = ? ORDER BY name ASC';
        const [services] = await db.execute(sql, [req.params.business_id]);

        res.json(services);
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;