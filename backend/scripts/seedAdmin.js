import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../configs/dbConfig.js';

const username = process.env.ROOT_USERNAME;
const password = process.env.ROOT_PASSWORD;

try {
  if (!username || !password) {
    throw new Error('ROOT_USERNAME and ROOT_PASSWORD are required');
  }

  const { rows } = await pool.query(
    "SELECT id FROM moderators WHERE role = 'ROOT' LIMIT 1"
  );

  if (rows.length) {
    console.log('ROOT already exists');
  } else {
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO moderators (username, password_hash, role) VALUES ($1, $2, 'ROOT')",
      [username, hash]
    );

    console.log('ROOT created');
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}