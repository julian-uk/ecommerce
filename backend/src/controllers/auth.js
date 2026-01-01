import UserModel from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authController = {

    /**
     * Handles user registration: hashes password and creates user entry.
     */
    register: async (req, res) => {
        const { username, email, password } = req.body;

        // Basic input validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Please provide username, email, and password.' });
        }

        try {
            // 1. Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: 'User with that email already exists.' });
            }

            // 2. Hash the password (using 10 salt rounds)
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 3. Create the user in the database
            const newUser = await UserModel.register(username, email, passwordHash);

            // 4. Respond with success (excluding sensitive data)
            res.status(201).json({ 
                message: 'User registered successfully. Please log in.',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Failed to register user.' });
        }
    },

    /**
     * Handles user login: verifies password and issues a JWT.
     */
    login: async (req, res) => {
        const { email, password } = req.body;

        // Basic input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }

        try {
            // 1. Find user by email (this includes the password_hash from the DB)
            const user = await UserModel.findByEmail(email);
            if (!user) {
                // Use a generic message to prevent user enumeration attacks
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            // 2. Compare the provided password with the hashed password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            // 3. Generate JWT Token
            const payload = {
                id: user.id,
                username: user.username,
                is_admin: user.is_admin
            };
            
            // Set token to expire in 24 hours (1 day)
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

            // 4. Respond with the token and user info
            console.log('Login successful for user:', user.is_admin);
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    is_admin: user.is_admin
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Failed to log in.' });
        }
    }
};

export default authController;
