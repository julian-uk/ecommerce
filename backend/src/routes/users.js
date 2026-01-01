import { Router } from 'express';
import userController from '../controllers/user.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Managing user profiles (requires authentication)
 */

// --- PROTECTED ROUTES ---
// All user profile management routes require a valid JWT token.
router.use(authenticate);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user's public profile
 *     tags: [Users]
 *     description: Returns public profile information for a specific user.  
 *       While the endpoint requires authentication, the response only contains public-safe data (e.g., username, avatar, join date).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose profile is being requested.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 */
router.get('/:id', userController.getUserProfile);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     tags: [Users]
 *     description: Allows an authenticated user to update their own profile details (e.g., name, email, or avatar).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "jane_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@example.com"
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://cdn.example.com/avatars/jane.png"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (attempt to modify another user's profile)
 *       404:
 *         description: User not found
 */
router.patch('/:id', userController.updateUserProfile);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete the authenticated user's account
 *     tags: [Users]
 *     description: Permanently deletes the authenticated user's account and associated data.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the authenticated user.
 *     responses:
 *       204:
 *         description: Account deleted successfully (No Content)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (attempt to delete another user's account)
 *       404:
 *         description: User not found
 */
router.delete('/:id', userController.deleteUser);

export default router;
