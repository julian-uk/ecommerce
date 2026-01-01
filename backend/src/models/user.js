import db from '../config/db.js'; // Correct ES Module import
import pool from '../config/db.js';
// Database interaction functions for the 'users' table
const UserModel = {

    /**
     * Creates a new user in the database.
     * @param {string} username 
     * @param {string} email 
     * @param {string} passwordHash - The bcrypt hashed password
     * @returns {Promise<object>} The newly created user object (excluding the hash)
     */
    register: async (username, email, passwordHash) => {
        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, is_admin, created_at;
        `;
        const values = [username, email, passwordHash];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Finds a user by email address. Includes the password hash for login verification.
     * @param {string} email 
     * @returns {Promise<object|null>} The user object or null if not found
     */
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1;';
        const result = await db.query(query, [email]);
        return result.rows[0];
    },

    /**
     * Finds a user by ID. Excludes the password hash for general use.
     * @param {number} id 
     * @returns {Promise<object|null>} The user object or null if not found
     */
    findById: async (id) => {
        const query = 'SELECT id, username, email, is_admin, created_at, updated_at FROM users WHERE id = $1;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    /**
     * Updates an existing user's details (username, email, or password_hash).
     * @param {number} id - The user ID
     * @param {object} updates - Object containing fields to update (e.g., {username: 'newname'})
     * @returns {Promise<object|null>} The updated user object or null if not found
     */
    update: async (id, updates) => {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Build the SET clause dynamically based on the updates object
        for (const [key, value] of Object.entries(updates)) {
            // Prevent attempting to update id or created_at fields directly
            if (['username', 'email', 'password_hash'].includes(key)) {
                fields.push(`${key} = $${paramIndex++}`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            // No valid fields to update
            return UserModel.findById(id); 
        }

        const setClause = fields.join(', ');
        values.push(id); // The last value is the ID for the WHERE clause ($4, $5, etc.)

        const query = `
            UPDATE users
            SET ${setClause}, updated_at = NOW()
            WHERE id = $${paramIndex}
            RETURNING id, username, email, is_admin, created_at, updated_at;
        `;
        
        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Deletes a user account by ID.
     * @param {number} id - The user ID
     * @returns {Promise<boolean>} True if user was deleted, false otherwise
     */
    remove: async (id) => {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id;';
        const result = await db.query(query, [id]);
        return result.rowCount > 0;
    },

    findByGoogleId: async (googleId) => {
        const result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        return result.rows[0];
    },

    // ADD THIS FUNCTION
  linkGoogleAccount: async (userId, googleId) => {
    const result = await pool.query(
      'UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *',
      [googleId, userId]
    );
    return result.rows[0];
  },
    
    createGoogleUser: async (userData) => {
        const { username, email, google_id, profile_pic } = userData;
        const result = await pool.query(
          `INSERT INTO users (username, email, google_id, profile_pic) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [username, email, google_id, profile_pic]
        );
        return result.rows[0];
    }
};

export default UserModel; // Correct ES Module export
