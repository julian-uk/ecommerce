import db from '../config/db.js';
import cartModel from './cart.js';
import productModel from './products.js';

const orderModel = {

    /**
     * Retrieves all orders for a specific user.
     * @param {number} userId - The user's ID.
     * @returns {Promise<Array<object>>} A list of orders with their items.
     */
    findOrdersByUserId: async (userId) => {
        const query = `
            SELECT 
                o.id AS order_id,
                o.order_date,
                o.total_amount,
                o.status,
                oi.product_id,
                p.name AS product_name,
                oi.quantity,
                oi.price_at_order
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = $1
            ORDER BY o.order_date DESC, o.id DESC;
        `;
        
        const result = await db.query(query, [userId]);
        
        // Group items by order
        const orders = {};
        result.rows.forEach(row => {
            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    id: row.order_id,
                    order_date: row.order_date,
                    total_amount: row.total_amount,
                    status: row.status,
                    items: []
                };
            }
            orders[row.order_id].items.push({
                product_id: row.product_id,
                name: row.product_name,
                quantity: row.quantity,
                price_at_order: row.price_at_order
            });
        });

        return Object.values(orders);
    },

    /**
     * Retrieves a single order by its ID, ensuring it belongs to the user.
     * @param {number} orderId - The order's ID.
     * @param {number} userId - The user's ID.
     * @returns {Promise<object|null>} The order object or null.
     */
    findOrderById: async (orderId, userId) => {
        const query = `
            SELECT 
                o.id AS order_id,
                o.order_date,
                o.total_amount,
                o.status,
                oi.product_id,
                p.name AS product_name,
                oi.quantity,
                oi.price_at_order
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.id = $1 AND o.user_id = $2;
        `;
        const result = await db.query(query, [orderId, userId]);

        if (result.rows.length === 0) {
            return null; // Order not found or doesn't belong to user
        }

        // Group the items into a single order object
        const order = {
            id: result.rows[0].order_id,
            order_date: result.rows[0].order_date,
            total_amount: result.rows[0].total_amount,
            status: result.rows[0].status,
            items: []
        };

        result.rows.forEach(row => {
            order.items.push({
                product_id: row.product_id,
                name: row.product_name,
                quantity: row.quantity,
                price_at_order: row.price_at_order
            });
        });

        return order;
    },

    /**
     * Creates a new order from a user's cart items using a database transaction.
     * @param {number} userId - The user's ID.
     * @param {Array<object>} cartItems - The list of items from the user's cart.
     * @param {number} totalAmount - The calculated total amount.
     * @param {object} client - A connected PostgreSQL client for the transaction.
     * @returns {Promise<object>} The newly created order.
     */
    createOrderTransaction: async (userId, cartItems, totalAmount, client) => {
        try {
            // 1. Create the 'orders' table entry
            const orderQuery = `
                INSERT INTO orders (user_id, total_amount, status)
                VALUES ($1, $2, 'Processing')
                RETURNING id, order_date, total_amount, status;
            `;
            const orderResult = await client.query(orderQuery, [userId, totalAmount]);
            const newOrder = orderResult.rows[0];
            const orderId = newOrder.id;
            console.log('Cart Items in Model:', cartItems);
            console.log('New Order:', newOrder.id);
            // 2. Loop through cart items and create 'order_items' entries
            // We use Promise.all to run these insertions concurrently
            const orderItemPromises = cartItems.map(item => {
                console.log('Inserting Order Item:', item.id, item.quantity, item.price);
                const itemQuery = `
                    INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
                    VALUES ($1, $2, $3, $4);
                `;
                return client.query(itemQuery, [orderId, item.id, item.quantity, item.price]);
            });
            
            // 3. Loop through cart items and update product stock
            const stockUpdatePromises = cartItems.map(item => {
                const stockQuery = `
                    UPDATE products
                    SET stock_quantity = stock_quantity - $1
                    WHERE id = $2;
                `;
                // We trust the controller/cart model to have validated stock, but a real-world app
                // would add a CHECK constraint (stock_quantity >= 0) in the DB.
                return client.query(stockQuery, [item.quantity, item.id]);
            });

            // 4. Clear the user's cart
            const clearCartQuery = `
                DELETE FROM cart_items
                WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1);
            `;
            const clearCartPromise = client.query(clearCartQuery, [userId]);

            // 5. Wait for all promises to resolve
            await Promise.all([
                ...orderItemPromises,
                ...stockUpdatePromises,
                clearCartPromise
            ]);

            return newOrder;

        } catch (error) {
            // If any step fails, the controller will catch this and roll back
            throw new Error(`Order Transaction Failed: ${error.message}`);
        }
    }
};

export default orderModel;

