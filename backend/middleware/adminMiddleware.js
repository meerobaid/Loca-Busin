const db = require('../config/db');

const adminMiddleware = async (req, res, next) => {
    try {
        // We assume authMiddleware has already run and attached req.user
        const userId = req.user.id;

        const [rows] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);

        if (rows.length === 0 || rows[0].role !== 'admin') {
            return res.status(403).json({ msg: 'Forbidden: Admin access required' });
        }

        // If user is an admin, proceed to the next function
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = adminMiddleware;