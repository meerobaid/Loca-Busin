const express = require('express');
const router = express.Router();
const businesses = require('../data/businesses');

// @route   GET /api/businesses
// @desc    Get all businesses
router.get('/', (req, res) => {
    res.json(businesses);
});

// @route   GET /api/businesses/:id
// @desc    Get a single business by ID
router.get('/:id', (req, res) => {
    const business = businesses.find(b => b.id === parseInt(req.params.id));
    if (!business) {
        return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
});

module.exports = router;