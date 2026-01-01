import db from '../config/db.js';

// CartModel handles database interactions for the carts and cart_items tables.
const CartModel = {

    /**
     * Finds or creates a cart for a given user ID.
     * @param {number} userId - The ID of the authenticated user.
     * @returns {Promise<object>} The user's cart object.
     */
    findOrCreateCart: async (userId) => {
        // First, try to find an existing cart for the user
        const findQuery = `
            SELECT id, user_id, created_at, updated_at
            FROM carts
            WHERE user_id = $1;
        `;
        const result = await db.query(findQuery, [userId]);
        
        if (result.rows.length > 0) {
            return result.rows[0];
        }

        // If no cart exists, create a new one
        const createQuery = `
            INSERT INTO carts (user_id)
            VALUES ($1)
            RETURNING id, user_id, created_at, updated_at;
        `;
        const createResult = await db.query(createQuery, [userId]);
        return createResult.rows[0];
    },

    /**
     * Retrieves the detailed contents of a user's cart, including product details.
     * @param {number} userId - The ID of the authenticated user.
     * @returns {Promise<object>} An object containing cart info and an array of items.
     */
    getCartDetails: async (userId) => {
        // This query joins carts, cart_items, and products to get a full view of the cart.
        const query = `
            SELECT
                ci.id AS cart_item_id,
                ci.quantity,
                p.id AS product_id,
                p.name AS product_name,
                p.price AS product_price,
                (ci.quantity * p.price) AS subtotal
            FROM carts c
            JOIN cart_items ci ON c.id = ci.cart_id
            JOIN products p ON ci.product_id = p.id
            WHERE c.user_id = $1
            ORDER BY ci.id;
        `;
        const result = await db.query(query, [userId]);

        // Find or create the cart object (we need the cart ID for later operations)
        const cart = await CartModel.findOrCreateCart(userId);

        return {
            cart_id: cart.id,
            user_id: cart.user_id,
            items: result.rows,
            // Total calculated in the controller
        };
    },

    /**
     * Adds a product to the cart or updates the quantity if it already exists.
     * @param {number} cartId - The ID of the user's cart.
     * @param {number} productId - The ID of the product to add.
     * @param {number} quantity - The quantity to add/set.
     * @returns {Promise<object>} The updated cart item.
     */
    addItem: async (cartId, productId, quantity) => {
        // Check if the item already exists in the cart
        const checkQuery = `
            SELECT id, quantity
            FROM cart_items
            WHERE cart_id = $1 AND product_id = $2;
        `;
        const checkResult = await db.query(checkQuery, [cartId, productId]);

        if (checkResult.rows.length > 0) {
            // Item exists, update the quantity (set new quantity)
            const updateQuery = `
                UPDATE cart_items
                SET quantity = $3, updated_at = NOW()
                WHERE cart_id = $1 AND product_id = $2
                RETURNING id, cart_id, product_id, quantity;
            `;
            const updateResult = await db.query(updateQuery, [cartId, productId, quantity]);
            return updateResult.rows[0];

        } else {
            // Item does not exist, insert a new row
            const insertQuery = `
                INSERT INTO cart_items (cart_id, product_id, quantity)
                VALUES ($1, $2, $3)
                RETURNING id, cart_id, product_id, quantity;
            `;
            const insertResult = await db.query(insertQuery, [cartId, productId, quantity]);
            return insertResult.rows[0];
        }
    },

    /**
     * Removes an item completely from the cart.
     * @param {number} cartId - The ID of the user's cart.
     * @param {number} productId - The ID of the product to remove.
     * @returns {Promise<boolean>} True if deletion was successful.
     */
    removeItem: async (cartId, productId) => {
        const deleteQuery = `
            DELETE FROM cart_items
            WHERE cart_id = $1 AND product_id = $2
            RETURNING id;
        `;
        const result = await db.query(deleteQuery, [cartId, productId]);
        return result.rows.length > 0;
    },

    /**
     * Clears all items from the user's cart.
     * @param {number} cartId - The ID of the user's cart.
     * @returns {Promise<void>}
     */
    clearCart: async (cartId) => {
        const query = 'DELETE FROM cart_items WHERE cart_id = $1;';
        await db.query(query, [cartId]);
    }
};

export default CartModel;
