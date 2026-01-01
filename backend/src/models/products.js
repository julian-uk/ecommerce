import db from '../config/db.js';

// CartModel handles database interactions for the carts and cart_items tables.
const ProductModel = {


    /**
     * Creates a new product in the database.
     * @param {object} productData - {name, description, price, stock_quantity}
     * @returns {Promise<object>} The newly created product object
     */
    create: async ({ name, description, price, stock_quantity }) => {
        const query = `
            INSERT INTO products (name, description, price, stock_quantity)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, description, price, stock_quantity, created_at, updated_at;
        `;
        const values = [name, description, price, stock_quantity];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Updates an existing product in the database.
     * @param {number} id - The product ID.
     * @param {object} updates - Fields to update ({name, description, price, stock_quantity}).
     * @returns {Promise<object|null>} The updated product object or null if not found.
     */
    update: async (id, updates) => {
        const fields = Object.keys(updates);
        if (fields.length === 0) return null; // Nothing to update

        // Dynamically build the SET clause and the values array
        const setClauses = fields.map((field, index) => {
            // $2, $3, $4... (index + 2 because $1 is the product ID)
            return `${field} = $${index + 2}`;
        }).join(', ');

        const query = `
            UPDATE products
            SET ${setClauses}, updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, description, price, stock_quantity, created_at, updated_at;
        `;

        const values = [id, ...Object.values(updates)];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Retrieves all products from the database.
     * @returns {Promise<Array<object>>} A list of all products.
     */
    findAll: async () => {
        const query = `
            SELECT id, name, description, price, stock_quantity, image_url, created_at, updated_at 
            FROM products 
            ORDER BY id ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    },

    /**
     * Retrieves a single product by its ID.
     * @param {number} id - The product ID.
     * @returns {Promise<object|null>} The product object or null if not found.
     */
    findById: async (id) => {
        const query = `
            SELECT id, name, description, price, stock_quantity, image_url, created_at, updated_at 
            FROM products 
            WHERE id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    /**
     * Deletes a product by its ID.
     * @param {number} id - The product ID.
     * @returns {Promise<boolean>} True if a product was deleted, false otherwise.
     */
    remove: async (id) => {
        const query = `
            DELETE FROM products
            WHERE id = $1
            RETURNING id;
        `;
        const result = await db.query(query, [id]);
        // result.rowCount is 1 if a row was deleted, 0 otherwise
        return result.rowCount > 0;
    },
};

export default ProductModel;
