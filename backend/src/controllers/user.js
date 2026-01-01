import userModel from '../models/user.js';
import { hash } from 'bcrypt';
import pool from '../config/db.js';
const userController = {

    /**
     * Handles GET /api/users/:id
     * Retrieves a user's profile information.
     */
    getUserProfile: async (req, res) => {
        const userId = parseInt(req.params.id, 10);
        
        try {
            // Use the findById model function (which excludes the password hash)
            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Respond with the public-safe user object
            res.json(user);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ error: 'Failed to retrieve user profile.' });
        }
    },

    /**
     * Handles PATCH /api/users/:id
     * Updates a user's profile information.
     */
    updateUserProfile: async (req, res) => {
        const userId = parseInt(req.params.id, 10);
        const { username, email, password } = req.body;

        const updates = {};
        
        // Only add fields to the update object if they were provided
        if (username) updates.username = username;
        if (email) updates.email = email;

        try {
            // 1. Check if a new password was provided
            if (password) {
                // Hash the new password before storing it
                const saltRounds = 10;
                updates.password_hash = await hash(password, saltRounds);
            }

            // 2. Ensure there's something to update
            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update.' });
            }

            // 3. Call the model function to update the user
            const updatedUser = await userModel.update(userId, updates);

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Respond with the updated (and safe) user object
            res.json(updatedUser);

        } catch (error) {
            console.error('Error updating user profile:', error);
            // Check for specific database errors, e.g., unique constraint violation (duplicate email)
            if (error.code === '23505') { // PostgreSQL unique violation
                return res.status(409).json({ error: 'An account with this email already exists.' });
            }
            res.status(500).json({ error: 'Failed to update user profile.' });
        }
    },

    /**
     * Handles DELETE /api/users/:id
     * Deletes a user's account.
     */
    deleteUser: async (req, res) => {
        const userId = parseInt(req.params.id, 10);
        
        try {
            const wasDeleted = await userModel.remove(userId);

            if (!wasDeleted) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Respond with 204 No Content on successful deletion
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user.' });
        }
    }
};

export default userController;