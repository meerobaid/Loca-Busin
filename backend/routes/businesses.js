const upload = require('../middleware/uploadMiddleware');
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

// // @route   POST api/businesses
// // @desc    Create a new business
// // @access  Private (Owner/Admin)
// // 👉 UPDATE 1: Removed 'adminMiddleware' from the brackets so Owners can use this!
// router.post('/', [authMiddleware, upload], async (req, res) => {
//     let { name, category, address, phone, description, capacity } = req.body;
    
//     // 👉 UPDATE 2: Cleaned up the image variable so it doesn't crash
//     let image = null;
//     if (req.file) {
//         image = `/uploads/${req.file.filename}`; // Or use req.file.path depending on your setup
//     }
    
//     capacity = capacity ? parseInt(capacity, 10) : null;

//     try {
//         // 👉 UPDATE 3: Added a manual role check to ensure ONLY Admins and Owners can do this
//         const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
//         if (userCheck.length === 0 || (userCheck[0].role !== 'owner' && userCheck[0].role !== 'admin')) {
//             return res.status(403).json({ msg: 'Access denied. Only Business Owners or Admins can create businesses.' });
//         }

//         if (!name || !category) {
//             return res.status(400).json({ msg: 'Please provide a name and category' });
//         }

//         // 👉 UPDATE 4: Added owner_id to the INSERT statement and VALUES list
//         const sql = `
//             INSERT INTO businesses 
//             (name, category, address, phone, image, description, capacity, owner_id) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;
        
//         // 👉 UPDATE 5: Put req.user.id at the very end of the array
//         const [result] = await db.execute(sql, [
//             name, 
//             category, 
//             address || null, 
//             phone || null, 
//             image, 
//             description || null, 
//             capacity, 
//             req.user.id // This links the business to the person logged in!
//         ]);

//         res.status(201).json({ msg: 'Business created successfully', businessId: result.insertId });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });


// @route   POST api/businesses
// @desc    Create a new business
// @access  Private (Owner/Admin)
router.post('/', [authMiddleware, upload], async (req, res) => {
    let { name, category, address, phone, description, capacity } = req.body;
    capacity = capacity ? parseInt(capacity, 10) : null;

    // 👉 UPDATE: Process MULTIPLE images
    let imageArray = [];
    if (req.files && req.files.length > 0) {
        // Loop through all uploaded files and grab their paths
        imageArray = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    // Convert the array into a JSON string so MySQL can save it in the TEXT column
    const imageStringToSave = JSON.stringify(imageArray);

    try {
        const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (userCheck.length === 0 || (userCheck[0].role !== 'owner' && userCheck[0].role !== 'admin')) {
            return res.status(403).json({ msg: 'Access denied.' });
        }

        if (!name || !category) {
            return res.status(400).json({ msg: 'Please provide a name and category' });
        }

        const sql = `
            INSERT INTO businesses 
            (name, category, address, phone, image, description, capacity, owner_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // 👉 UPDATE: Pass 'imageStringToSave' instead of the single image
        const [result] = await db.execute(sql, [
            name, 
            category, 
            address || null, 
            phone || null, 
            imageStringToSave, // This saves as '["/uploads/img1.jpg", "/uploads/img2.jpg"]'
            description || null, 
            capacity, 
            req.user.id 
        ]);

        res.status(201).json({ msg: 'Business created successfully', businessId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/businesses/my-businesses
// @desc    Get ONLY the businesses owned by the logged-in owner
// @access  Private (Owner only)
router.get('/my-businesses', authMiddleware, async (req, res) => {
    try {
        // Double-check they are an owner or admin
        const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (userCheck.length === 0 || (userCheck[0].role !== 'owner' && userCheck[0].role !== 'admin')) {
            return res.status(403).json({ msg: 'Access denied. Owners only.' });
        }

        // Fetch businesses linked to their specific ID
        const [myBusinesses] = await db.execute('SELECT * FROM businesses WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id]);
        
        res.json(myBusinesses);
    } catch (err) {
        console.error('Error fetching owner businesses:', err.message);
        res.status(500).send('Server Error');
    }
});


// ... The GET and POST routes are already here ...

// @route   PUT api/businesses/:id
// @desc    Update a business
// @access  Private (Admin)

// @route   PUT api/businesses/:id
// @desc    Update a business
// @access  Private (Admin or the Business Owner)
// 👉 NOTE: We removed adminMiddleware from the line below!
router.put('/:id', authMiddleware, async (req, res) => {
    const { name, category, description } = req.body;
    const businessId = req.params.id;
    const userId = req.user.id; // From authMiddleware

    try {
        // 1. Fetch the business to see who the owner is
        const [businessCheck] = await db.execute('SELECT owner_id FROM businesses WHERE id = ?', [businessId]);

        if (businessCheck.length === 0) {
            return res.status(404).json({ msg: 'Business not found' });
        }

        const ownerId = businessCheck[0].owner_id;

        // 2. Security Check: Get the logged-in user's role
        const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
        const userRole = userCheck[0].role;

        // 3. Permission Logic: Only let them proceed if they are Admin OR the actual Owner
        if (userRole !== 'admin' && ownerId !== userId) {
            return res.status(403).json({ 
                msg: 'Forbidden: You do not have permission to edit this business.' 
            });
        }

        // 4. If they pass, perform the update
        const sql = 'UPDATE businesses SET name = ?, category = ?, description = ? WHERE id = ?';
        await db.execute(sql, [name, category, description, businessId]);

        res.json({ msg: 'Business updated successfully!' });

    } catch (err) {
        console.error('Update Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/businesses/:id
// @desc    Delete a business
// @access  Private (Admin or the Owner of the business)
// 👉 UPDATE: Removed adminMiddleware from the brackets!
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // 1. Get the logged-in user's role
        const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
        
        if (userCheck.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        const userRole = userCheck[0].role;

        // If they are a normal customer, block them immediately
        if (userRole !== 'admin' && userRole !== 'owner') {
            return res.status(403).json({ msg: 'Access denied. Only Admins and Owners can delete.' });
        }

        // 2. If the user is an owner, we must verify they actually own THIS specific business!
        if (userRole === 'owner') {
            const [businessCheck] = await db.execute('SELECT owner_id FROM businesses WHERE id = ?', [req.params.id]);
            
            if (businessCheck.length === 0) {
                return res.status(404).json({ msg: 'Business not found' });
            }

            // Security Check: Does the logged-in owner ID match the business's owner_id?
            if (businessCheck[0].owner_id !== req.user.id) {
                return res.status(403).json({ msg: 'Forbidden: You can only delete your own businesses.' });
            }
        }

        // 3. If they are an Admin, OR they passed the owner check, delete the business
        const [result] = await db.execute('DELETE FROM businesses WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Business not found' });
        }

        res.json({ msg: 'Business removed successfully' });

    } catch (err) {
        console.error('Error deleting business:', err.message);
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