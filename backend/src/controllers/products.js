import ProductModel from '../models/products.js';

/**
 * Handles POST /api/products
 * Creates a new product (Admin only).
 */
const createProduct = async (req, res) => {
    const { name, description, price, stock_quantity } = req.body;

    // Simple validation check
    if (!name || !description || typeof price !== 'number' || price <= 0 || typeof stock_quantity !== 'number' || stock_quantity < 0) {
        return res.status(400).json({ error: 'Missing or invalid product fields.' });
    }

    try {
        const productData = { name, description, price, stock_quantity };
        const newProduct = await ProductModel.create(productData);
        
        // Respond with the newly created product (201 Created)
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product due to a database error.' });
    }
};

/**
 * Handles PATCH /api/products/:id
 * Updates an existing product (Admin only).
 */
const updateProduct = async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const updates = req.body;
    
    // Remove potentially insecure fields or ID from updates object
    delete updates.id;
    delete updates.created_at;

    // Basic validation for numeric fields if they exist
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
        return res.status(400).json({ error: 'Price must be a positive number.' });
    }
    if (updates.stock_quantity !== undefined && (typeof updates.stock_quantity !== 'number' || updates.stock_quantity < 0)) {
        return res.status(400).json({ error: 'Stock quantity must be a non-negative integer.' });
    }
    
    // Ensure there is at least one field to update
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    try {
        const updatedProduct = await ProductModel.update(productId, updates);

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product due to a database error.' });
    }
};

/**
 * Handles GET /api/products
 * Retrieves all products (Public access).
 */
const getAllProducts = async (req, res) => {
    try {
        // FIXED: Changed productModel to ProductModel
        const products = await ProductModel.findAll();
        res.json(products);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ error: 'Failed to retrieve products due to a database error.' });
    }
};

/**
 * Handles GET /api/products/:id
 * Retrieves a single product by ID (Public access).
 */
const getProductById = async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    
    try {
        // FIXED: Changed productModel to ProductModel
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ error: 'Failed to retrieve product due to a database error.' });
    }
};

/**
 * Handles DELETE /api/products/:id
 * Deletes a product (Admin only).
 */
const deleteProduct = async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    
    try {
        // FIXED: Changed productModel to ProductModel
        const wasDeleted = await ProductModel.remove(productId);

        if (!wasDeleted) {
            // Return 404 if the product ID didn't exist
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Return 204 No Content for a successful deletion
        res.status(204).send(); 
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product due to a database error.' });
    }
};

// FIXED: Defined the productController object for export
const productController = {
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
    deleteProduct
};

export default productController;
