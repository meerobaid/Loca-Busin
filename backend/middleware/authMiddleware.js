const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    console.log('\n--- Auth Middleware Triggered ---');

    // 1. Get token from the header
    const token = req.header('x-auth-token');
    console.log('1. Received Token:', token);

    if (!token) {
        console.log('--> ERROR: No token was found in the header.');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 2. Define the secret key to be used for verification
    const secretKey = 'a_secret_key';
    console.log('2. Using Secret Key:', secretKey);
    
    // 3. Try to verify the token
    try {
        console.log('3. Attempting to verify token...');
        // const decoded = jwt.verify(token, secretKey);
        const decoded = jwt.verify(token, 'LocaBusin_Secret_123!');

        console.log('4. SUCCESS! Decoded Payload:', decoded);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.log('--> 4. FAILED! Token verification threw an error.');
        console.error('--> The specific error is:', err.message); // This will tell us exactly why
        res.status(401).json({ msg: 'Token is not valid' });
    }
};