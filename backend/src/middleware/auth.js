import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; // Ensure your DB pool is imported

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT:", decoded);
        // 🔍 Fetch the ACTUAL user from the DB using the ID in the token
        const result = await pool.query(
            'SELECT id, username, email, is_admin, profile_pic FROM users WHERE id = $1', 
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Attach the full database user object to req.user
        req.user = result.rows[0]; 
        
        next();
    } catch (ex) {
        console.error("JWT verification failed:", ex.message);
        return res.status(401).json({ error: 'Invalid token.' });
    }
};