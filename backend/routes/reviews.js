const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Post a new review for a business
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { business_id, rating, comment } = req.body;
    const user_id = req.user.id;

    try {
        if (!business_id || !rating) {
            return res.status(400).json({ msg: 'Please provide a business ID and a rating' });
        }

        const sql = 'INSERT INTO reviews (user_id, business_id, rating, comment) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [user_id, business_id, rating, comment || null]);

        res.status(201).json({ msg: 'Review posted successfully', reviewId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/reviews/:business_id
// @desc    Get all reviews for a specific business
// @access  Public
router.get('/:business_id', async (req, res) => {
    try {
        // We use a JOIN to get the reviewer's name from the users table
        const sql = `
            
        SELECT r.review_id, r.user_id, r.rating, r.comment, r.created_at, u.name AS reviewer_name 
            FROM reviews AS r
            JOIN users AS u ON r.user_id = u.id
            WHERE r.business_id = ?
            ORDER BY r.created_at DESC
        `;
        const [reviews] = await db.execute(sql, [req.params.business_id]);

        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        // Security Check: Make sure the review exists and belongs to the user trying to delete it
        const findSql = 'SELECT * FROM reviews WHERE review_id = ? AND user_id = ?';
        const [rows] = await db.execute(findSql, [reviewId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Review not found or you are not authorized to delete it' });
        }

        // If the check passes, delete the review
        const deleteSql = 'DELETE FROM reviews WHERE review_id = ?';
        await db.execute(deleteSql, [reviewId]);

        res.json({ msg: 'Review deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update (edit) a review
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;
    const userId = req.user.id;

    try {
        // Security Check: Make sure the review exists and belongs to the user trying to edit it
        const findSql = 'SELECT * FROM reviews WHERE review_id = ? AND user_id = ?';
        const [rows] = await db.execute(findSql, [reviewId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Review not found or you are not authorized to edit it' });
        }

        // If the check passes, update the review
        const updateSql = 'UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?';
        await db.execute(updateSql, [rating, comment || null, reviewId]);

        res.json({ msg: 'Review updated successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;