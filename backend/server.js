import express from 'express';
import cors from 'cors';
// FIX: Changed path from './config/db.js' to './src/config/db.js'
import db from './src/config/db.js'; 
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// --- Import Routers ---
import authRouter from './src/routes/auth.js';
import usersRouter from './src/routes/users.js';
import productsRouter from './src/routes/products.js';
import cartRouter from './src/routes/carts.js';
import ordersRouter from './src/routes/orders.js';
import passport from 'passport';
import './src/config/passport.js'; // Passport configuration

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // <--- This allows the token to pass
    credentials: true
}));
app.use(express.json()); // Body parser middleware
app.use(passport.initialize());
// --- Database Connection Check ---
db.pool.connect();

// --- Swagger Setup ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce REST API Documentation',
            version: '1.0.0',
            description: 'A robust and secure backend API for an e-commerce application.',
        },
        servers: [
            {
                url: `http://localhost:${port}/api`,
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter the JWT token provided upon login/registration.'
                }
            }
        },
        security: [{
            BearerAuth: []
        }]
    },
    // The glob pattern is correct, assuming all route files are in './src/routes'
    apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// --- End Swagger Setup ---


// --- Route Mounting ---
app.get('/', (req, res) => {
    res.send('Welcome to the E-Commerce API. Documentation available at /api-docs');
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);


// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Documentation available at http://localhost:${port}/api-docs`);
});

// Final export for testing or further use
export default app;
