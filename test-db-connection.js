import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function testConnection() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Successfully connected to the database.');

    const [rows] = await connection.execute('SELECT * FROM products LIMIT 5');
    console.log('Sample products:', rows);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();

