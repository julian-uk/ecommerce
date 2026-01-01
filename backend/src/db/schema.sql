--
-- E-COMMERCE REST API DATABASE SCHEMA
-- PostgreSQL

-- 1. Users Table
-- Stores customer and administrative account information.

CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(50) UNIQUE NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
-- Store hashed password using bcrypt (e.g., 60 characters is standard for bcrypt)
password_hash CHAR(60) NOT NULL,
first_name VARCHAR(50),
last_name VARCHAR(50),
-- Used for authorization middleware to distinguish between customers and admins
is_admin BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
-- Stores information about items available for sale.

CREATE TABLE products (
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
description TEXT,
-- Numeric data type for precise monetary values
price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
image_url VARCHAR(255),
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Carts Table
-- Stores a simple record to tie a cart session to a user.

CREATE TABLE carts (
id SERIAL PRIMARY KEY,
-- FOREIGN KEY linking the cart to a user. Ensures only one cart per user.
user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cart Items Table
-- Stores the specific products (and quantity) currently in a user's cart.

CREATE TABLE cart_items (
id SERIAL PRIMARY KEY,
cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
quantity INTEGER NOT NULL CHECK (quantity > 0),
-- Ensures a product appears only once per cart
UNIQUE (cart_id, product_id)
);

-- 5. Orders Table
-- Stores placed orders, serving as the record of a transaction.

CREATE TYPE order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');

CREATE TABLE orders (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
-- Total amount calculated at the time of order placement
total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
status order_status DEFAULT 'Pending',
shipping_address TEXT NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table
-- Stores the specific products (and quantity) contained within a placed order.
-- This is independent of the products table to maintain historical prices.

CREATE TABLE order_items (
id SERIAL PRIMARY KEY,
order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
quantity INTEGER NOT NULL CHECK (quantity > 0),
-- Store the price at the time of purchase (important for sales records)
price_at_order NUMERIC(10, 2) NOT NULL,
-- Ensures a product appears only once per order
UNIQUE (order_id, product_id)
);

-- 7. Trigger to Update timestamps
-- Automatically updates the 'updated_at' column on row modification.
-- This is optional but good practice for auditing.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for other tables (carts, orders) as needed.