const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ensure this points to your db connection file

// 1. Record a visit (This runs every time a user clicks a business)
router.post('/track', async (req, res) => {
    const { user_id, business_id } = req.body;
    try {
        // This SQL checks if the user visited before; if yes, it adds 1 to visit_count
        const sql = `
            INSERT INTO user_activity (user_id, business_id, visit_count)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE visit_count = visit_count + 1
        `;
        await db.execute(sql, [user_id, business_id]);
        res.status(200).json({ msg: 'Activity tracked' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2- Get top visited businesses for a specific user
router.get('/recommendations/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const sql = `
            SELECT b.*, ua.visit_count 
            FROM businesses b
            JOIN user_activity ua ON b.id = ua.business_id
            WHERE ua.user_id = ?
            ORDER BY ua.visit_count DESC
            LIMIT 4
        `;
        const [rows] = await db.execute(sql, [user_id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;