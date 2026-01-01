import CartModel from '../models/cart.js';
import ProductModel from '../models/products.js'; // Note: Changed to 'product.js' for consistency with models/user.js
// Note: authenticate is middleware and not needed inside the controller

/**
 * Helper function to calculate the total price of the cart.
 * @param {Array<object>} items - Array of cart item objects, each with a 'subtotal' property.
 * @returns {number} The total price.
 */
const calculateTotal = (items) => {
    // Ensure all subtotals are treated as numbers before summing
    return items.reduce((total, item) => total + parseFloat(item.subtotal || 0), 0);
};

/**
 * GET /api/cart - Retrieves the current user's cart details.
 */
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        // This function should calculate the subtotal price (quantity * price) per item
        const cartDetails = await CartModel.getCartDetails(userId);
        
        // Calculate the total based on the items retrieved
        const total = calculateTotal(cartDetails.items);

        res.json({
            cart_id: cartDetails.cart_id,
            user_id: cartDetails.user_id,
            items: cartDetails.items,
            total: parseFloat(total.toFixed(2)) // Ensure float and two decimal places
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to retrieve cart contents.' });
    }
};

/**
 * POST /api/cart - Adds a product to the cart or updates the quantity (incrementing).
 * Note: This version is designed to INCREMENT the quantity if the item exists.
 */
const addItemToCart = async (req, res) => {
    const { product_id, quantity: requestedQuantity } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!product_id || requestedQuantity === undefined || requestedQuantity <= 0) {
        return res.status(400).json({ error: 'Invalid product ID or quantity.' });
    }

    try {
        // 1. Check if product exists and check stock
        const product = await ProductModel.findById(product_id);
        if (!product || product.stock_quantity < requestedQuantity) {
            return res.status(404).json({ error: 'Product not found or insufficient stock.' });
        }

        // 2. Find or create the user's cart
        const cart = await CartModel.findOrCreateCart(userId);

        // 3. Add/Update item in the cart (CartModel must handle existing item logic)
        await CartModel.addItem(cart.id, product_id, requestedQuantity);

        // 4. Respond with the updated cart details
        const updatedCartDetails = await CartModel.getCartDetails(userId);
        const total = calculateTotal(updatedCartDetails.items);

        res.status(200).json({
            message: 'Cart item added/updated successfully.',
            cart: {
                ...updatedCartDetails,
                total: parseFloat(total.toFixed(2))
            }
        });

    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart.' });
    }
};

/**
 * PATCH /api/cart - Updates the quantity of a specific cart item to an absolute value.
 * This is crucial for user interface controls (e.g., setting quantity directly to 5).
 */
const updateCartItemQuantity = async (req, res) => {
    const { product_id, quantity: newQuantity } = req.body;
    const userId = req.user.id;

    if (!product_id || newQuantity === undefined || newQuantity < 0) {
        return res.status(400).json({ error: 'Invalid product ID or new quantity.' });
    }
    
    // If the requested quantity is 0, we treat it as a removal
    if (newQuantity === 0) {
        req.params.product_id = product_id;
        return removeItemFromCart(req, res); // Call the removal function
    }

    try {
        // 1. Check stock for the new quantity
        const product = await ProductModel.findById(product_id);
        if (!product || product.stock_quantity < newQuantity) {
             return res.status(400).json({ error: 'Insufficient stock for requested quantity.' });
        }
        
        // 2. Find the user's cart
        const cart = await CartModel.findOrCreateCart(userId);

        // 3. Update the item quantity to the absolute new value
        const updatedItem = await CartModel.updateItemQuantity(cart.id, product_id, newQuantity);

        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found in cart.' });
        }

        // 4. Respond with the updated cart details
        const updatedCartDetails = await CartModel.getCartDetails(userId);
        const total = calculateTotal(updatedCartDetails.items);

        res.json({
            message: 'Cart item quantity updated successfully.',
            cart: {
                ...updatedCartDetails,
                total: parseFloat(total.toFixed(2))
            }
        });

    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ error: 'Failed to update item quantity.' });
    }
};


/**
 * DELETE /api/cart/:product_id - Removes a specific product from the cart.
 */
const removeItemFromCart = async (req, res) => {
    // Note: Parameter name changed from 'productId' to 'product_id' for consistency with request body
    const product_id = parseInt(req.params.product_id, 10); 
    const userId = req.user.id;

    if (isNaN(product_id)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
    }

    try {
        // 1. Find the user's cart
        const cart = await CartModel.findOrCreateCart(userId);

        // 2. Remove the item
        const wasRemoved = await CartModel.removeItem(cart.id, product_id);

        if (!wasRemoved) {
            return res.status(404).json({ error: 'Item not found in cart.' });
        }

        // 3. Respond with the updated cart details
        const updatedCartDetails = await CartModel.getCartDetails(userId);
        const total = calculateTotal(updatedCartDetails.items);

        res.json({
            message: `Product ID ${product_id} removed from cart.`,
            cart: {
                ...updatedCartDetails,
                total: parseFloat(total.toFixed(2))
            }
        });

    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart.' });
    }
};

// Export all controller methods as a single object
const cartController = {
    getCart,
    addItemToCart,
    updateCartItemQuantity, // Added the missing function
    removeItemFromCart
};


export default cartController;
