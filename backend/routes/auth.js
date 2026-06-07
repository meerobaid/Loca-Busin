// // const express = require('express');
// // const router = express.Router();
// // const { OAuth2Client } = require('google-auth-library');
// // const db = require('../config/db'); // Points to your pool.promise() db.js file

// // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // // Google Login Endpoint
// // router.post('/google', async (req, res) => {
// //     const { token } = req.body;

// //     if (!token) {
// //         return res.status(400).json({ error: 'Token is required' });
// //     }

// //     try {
// //         // 1. Verify the token with Google
// //         const ticket = await client.verifyIdToken({
// //             idToken: token,
// //             audience: process.env.GOOGLE_CLIENT_ID,
// //         });
        
// //         const payload = ticket.getPayload();
// //         const { email, name, picture } = payload;

// //         // 2. Check if the user already exists in your MySQL database
// //         const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

// //         let userId;

// //         if (existingUsers.length > 0) {
// //             // User exists, grab their ID
// //             userId = existingUsers[0].id;
// //         } else {
// //             // User is new, insert them into the users table automatically (Default role: customer)
// //             const [result] = await db.execute(
// //                 'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
// //                 [name, email, 'customer']
// //             );
// //             userId = result.insertId;
// //         }

// //         // 3. Send back the User Data and MySQL ID to the frontend
// //         res.json({
// //             success: true,
// //             userId: userId,
// //             name: name,
// //             email: email,
// //             picture: picture
// //         });

// //     } catch (error) {
// //         console.error('Google Auth Error:', error);
// //         res.status(401).json({ error: 'Invalid Google Token' });
// //     }
// // });

// // module.exports = router;



// const express = require('express');
// const router = express.Router();
// const { OAuth2Client } = require('google-auth-library');
// const jwt = require('jsonwebtoken'); // 👈 1. ADDED THIS IMPORT
// const db = require('../config/db'); 

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Google Login Endpoint
// router.post('/google', async (req, res) => {
//     const { token } = req.body;

//     if (!token) {
//         return res.status(400).json({ error: 'Token is required' });
//     }

//     try {
//         // 1. Verify the token with Google
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });
        
//         const payload = ticket.getPayload();
//         const { email, name, picture } = payload;

//         // 2. Check if the user already exists in your MySQL database
//         const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

//         let userId;
//         let userRole = 'customer'; // Default fallback role

//         if (existingUsers.length > 0) {
//             // User exists, grab their ID and real database role (admin/owner/customer)
//             userId = existingUsers[0].id;
//             userRole = existingUsers[0].role || 'customer'; 
//         } else {
//             // User is new, insert them into the users table automatically
//             const [result] = await db.execute(
//                 'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
//                 [name, email, 'customer']
//             );
//             userId = result.insertId;
//         }

//         // 🌟 2. GENERATE A REAL LOCAL SESSION TOKEN SIGNED WITH YOUR EXACT SECRET KEY
//         const localAppToken = jwt.sign(
//             { 
//                 user: { id: userId },
//                 userId: userId,
//                 role: userRole 
//             },
//             'a_secret_key', // 👈 Perfectly matching your backend middleware!
//             { expiresIn: '7d' }
//         );

//         // 3. Send back the User Data, Role, AND the generated Token to the frontend
//         res.json({
//             success: true,
//             token: localAppToken, // 👈 3. CRITICAL: Pass the token back to app.js
//             userId: userId,
//             name: name,
//             email: email,
//             role: userRole, // 👈 4. CRITICAL: Pass the role back to satisfy the admin view guard
//             picture: picture
//         });

//     } catch (error) {
//         console.error('Google Auth Error:', error);
//         res.status(401).json({ error: 'Invalid Google Token' });
//     }
// });
 
// module.exports = router;

const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db'); // Points to your pool.promise() db.js file

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login Endpoint
router.post('/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        // 1. Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // 2. Check if the user already exists in your MySQL database
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        let userId;

        if (existingUsers.length > 0) {
            // User exists, grab their ID
            userId = existingUsers[0].id;
        } else {
            // User is new, insert them into the users table automatically (Default role: customer)
            const [result] = await db.execute(
                'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
                [name, email, 'customer']
            );
            userId = result.insertId;
        }

        // 3. Send back the User Data and MySQL ID to the frontend
        res.json({
            success: true,
            userId: userId,
            name: name,
            email: email,
            picture: picture
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Invalid Google Token' });
    }
});

module.exports = router;