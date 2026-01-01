import { Router } from 'express';
import orderController from '../controllers/order.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Managing customer orders and checkout process
 */

// All order routes require a valid JWT token
router.use(authenticate);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order (Checkout)
 *     tags: [Orders]
 *     description: Converts the authenticated user's current shopping cart into a permanent order via a database transaction.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully. The cart is now empty.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 501
 *                 order_date:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-11-04T10:30:00Z
 *                 total_amount:
 *                   type: number
 *                   format: float
 *                   example: 125.98
 *                 status:
 *                   type: string
 *                   example: "Completed"
 *       400:
 *         description: Bad Request (e.g., cart is empty, insufficient stock, shipping address missing)
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       500:
 *         description: Server error (Database transaction failed)
 */
router.post('/', authenticate, orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Orders]
 *     description: Retrieves the order history for the logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   order_id:
 *                     type: integer
 *                     example: 501
 *                   order_date:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-04T10:30:00Z
 *                   total_amount:
 *                     type: number
 *                     format: float
 *                     example: 125.98
 *                   status:
 *                     type: string
 *                     example: "Delivered"
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product_id:
 *                           type: integer
 *                           example: 12
 *                         name:
 *                           type: string
 *                           example: "Wireless Mouse"
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *                         price:
 *                           type: number
 *                           format: float
 *                           example: 29.99
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, orderController.getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     description: Retrieves the details for a single order, ensuring it belongs to the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: integer
 *                   example: 501
 *                 order_date:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-11-04T10:30:00Z
 *                 total_amount:
 *                   type: number
 *                   format: float
 *                   example: 125.98
 *                 status:
 *                   type: string
 *                   example: "Delivered"
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: integer
 *                         example: 8
 *                       name:
 *                         type: string
 *                         example: "Bluetooth Keyboard"
 *                       quantity:
 *                         type: integer
 *                         example: 1
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 49.99
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found or does not belong to the user
 */
router.get('/:id' ,orderController.getOrderById);

export default router;
