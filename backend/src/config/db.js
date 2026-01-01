import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.connect()
  .then(() => {
    console.log('✅ PostgreSQL client successfully connected!');
  })
  .catch((err) => {
    console.error('❌ Error connecting to PostgreSQL database:', err.stack);
  });

// Export default the query function and pool object
export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
