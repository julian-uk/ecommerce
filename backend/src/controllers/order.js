import orderModel from '../models/order.js';
import cartModel from '../models/cart.js';
import productModel from '../models/products.js';
import db from '../config/db.js';

const orderController = {

    /**
     * Handles POST /api/orders
     * Creates a new order from the user's cart (Checkout).
     * This function manages the database transaction.
     */
    createOrder: async (req, res) => {
        const userId = req.user.id;
        
        // 1. Get a database client from the pool. This is essential for transactions.
        const client = await db.pool.connect();

        try {
            // 2. Fetch the user's cart items
            const orderItems = req.body.items || [];  // Allow injection for testing
            console.log('Order Items2:', orderItems);
            if (orderItems.length === 0) {
                return res.status(400).json({ error: 'Cannot create order: Your cart is empty.' });
            }

            // 3. Validate stock and calculate total
            let totalAmount = 0;
            for (const item of orderItems) {
                // We must fetch the *current* product details to validate stock
                const product = await productModel.findById(item.id);
                if (!product || product.stock_quantity < item.quantity) {
                    return res.status(400).json({ 
                        error: `Not enough stock for ${item.name}. Available: ${product ? product.stock_quantity : 0}, In Cart: ${item.quantity}`
                    });
                }
                // Use the current price from the database for the total calculation
                totalAmount += product.price * item.quantity;
                // We pass the cart item price (which might be stale) to the order model
                // for historical record, but calculate total based on current price.
                item.price = product.price; // Update item price to current price
            }

            // 4. Start the database transaction
            await client.query('BEGIN');
            
            // 5. Pass the client to the model's transaction function
            const newOrder = await orderModel.createOrderTransaction(userId, orderItems, totalAmount, client);

            // 6. If successful, commit the transaction
            await client.query('COMMIT');
            
            // 7. Respond with the new order details
            res.status(201).json(newOrder);

        } catch (error) {
            // 8. If any step fails, roll back the transaction
            await client.query('ROLLBACK');
            console.error('Order creation failed:', error);
            res.status(500).json({ error: `Order creation failed: ${error.message}` });
        } finally {
            // 9. Always release the client back to the pool
            client.release();
        }
    },
    // 

    /**
     * Handles GET /api/orders
     * Retrieves all orders for the authenticated user.
     */
    getOrders: async (req, res) => {
        const userId = req.user.id;
        try {
            const orders = await orderModel.findOrdersByUserId(userId);
            res.json(orders);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ error: 'Failed to retrieve orders.' });
        }
    },

    /**
     * Handles GET /api/orders/:id
     * Retrieves a single order by ID for the authenticated user.
     */
    getOrderById: async (req, res) => {
        const userId = req.user.id;
        const orderId = parseInt(req.params.id, 10);
        
        try {
            const order = await orderModel.findOrderById(orderId, userId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found or you do not have permission to view it.' });
            }
            res.json(order);
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            res.status(500).json({ error: 'Failed to retrieve order.' });
        }
    }
};

export default orderController;