import { Router } from 'express';
import productController from '../controllers/products.js';
import { authorizeAdmin } from '../middleware/authorization.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Managing the product catalog (Admin access required for Create, Update, and Delete)
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of all products
 *     tags: [Products]
 *     description: Public endpoint to fetch the entire product catalog.
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     description: Public endpoint to retrieve details for a specific product.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     description: Admin-only endpoint to add a new product. Requires Admin authorization.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - stock_quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wireless Mouse"
 *               description:
 *                 type: string
 *                 example: "Ergonomic Bluetooth mouse with silent clicks."
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 29.99
 *               stock_quantity:
 *                 type: integer
 *                 example: 150
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       403:
 *         description: Forbidden (Not an admin)
 */
router.post('/', authenticate, authorizeAdmin, productController.createProduct);
// To this (temporarily):
//router.post('/', productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update an existing product
 *     tags: [Products]
 *     description: Admin-only endpoint to modify product details. Requires Admin authorization.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wireless Mouse Pro"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 34.99
 *               stock_quantity:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       404:
 *         description: Product not found
 */
router.patch('/:id',authenticate, authorizeAdmin, productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     description: Admin-only endpoint to remove a product. Requires Admin authorization.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully (No Content)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       404:
 *         description: Product not found
 */
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct);

export default router;
