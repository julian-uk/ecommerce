import { Router } from 'express';
import authController from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import passport from 'passport';
import jwt from 'jsonwebtoken'; // 1. Ensure this is imported at the top

const router = Router();
// 2. Add this helper function (usually above your routes)
const generateToken = (user) => {
    return jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin }, // Data to store in the token
      process.env.JWT_SECRET,             // Your secret key from .env
      { expiresIn: '1d' }                // Token duration
    );
  };

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User registration and login
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *    summary: Register a new user
 *    tags: [Auth]
 *    description: Creates a new user account with a unique email and hashed password.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - username
 *              - email
 *              - password
 *            properties:
 *              username:
 *                type: string
 *                example: jane_doe
 *              email:
 *                type: string
 *                format: email
 *                example: jane.doe@example.com
 *              password:
 *                type: string
 *                format: password
 *                example: MySecureP@ss123
 *    responses:
 *      201:
 *        description: User registered successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: JWT token for authenticated requests
 *                user_id:
 *                  type: integer
 *                  description: ID of the newly registered user
 *      400:
 *        description: Invalid input (e.g., missing fields, email already in use)
 *      500:
 *        description: Server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     description: Authenticates a user and returns a JWT token for subsequent requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecureP@ss123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *                 user_id:
 *                   type: integer
 *                   description: ID of the logged-in user
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Check authentication status
 *     tags: [Auth]
 *     description: Uses the provided JWT token to check if the user is authenticated and returns their details.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 is_authenticated:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (Invalid or missing token)
 */
router.get('/status', authenticate, (req, res) => {
    // If the authenticate middleware passes, req.user is populated.
    res.json({
        is_authenticated: true,
        user: req.user,
    });
});

// This starts the Google login process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google redirects back here after user logs in
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // Successful authentication, generate a JWT for the user
        console.log('Google OAuth successful, user:', req.user.username);
         // 3. Generate JWT Token
         const payload = {
            id: req.user.id,
            username: req.user.username,
            is_admin: req.user.is_admin
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        //const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const frontendUrl = process.env.FRONTEND_URL;
        res.redirect(`${frontendUrl}/login-success?token=${token}`);
        //res.redirect(`http://localhost:5173/login-success?token=${token}`);

    }
  );

export default router;
