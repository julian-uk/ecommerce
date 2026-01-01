import { Router } from 'express';
import cartController from '../controllers/cart.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Managing the user's shopping cart
 */

// All cart routes require a valid JWT token
router.use(authenticate);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Retrieve the authenticated user's shopping cart
 *     tags: [Cart]
 *     description: Fetches all items, quantities, and totals for the current user's cart.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The user's shopping cart details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart_id:
 *                   type: integer
 *                   example: 101
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 total_items:
 *                   type: integer
 *                   example: 3
 *                 total_price:
 *                   type: number
 *                   format: float
 *                   example: 99.97
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: "Gaming Headset"
 *                       quantity:
 *                         type: integer
 *                         example: 1
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 59.99
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add a product to the cart or update its quantity
 *     tags: [Cart]
 *     description: Adds a product to the cart. If the product is already present, the quantity is increased.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 12
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Invalid input (e.g., product_id missing, insufficient stock)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/', cartController.addItemToCart);

/**
 * @swagger
 * /cart:
 *   patch:
 *     summary: Update the quantity of a specific cart item
 *     tags: [Cart]
 *     description: Sets a specific item's quantity to a new value. If quantity is 0, the item is removed.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 12
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 */
router.patch('/', cartController.updateCartItemQuantity);

/**
 * @swagger
 * /cart/{product_id}:
 *   delete:
 *     summary: Remove a product entirely from the cart
 *     tags: [Cart]
 *     description: Removes a specific product item regardless of its current quantity.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to remove from the cart.
 *     responses:
 *       204:
 *         description: Item removed successfully (No Content)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 */
router.delete('/:product_id', cartController.removeItemFromCart);

export default router;
