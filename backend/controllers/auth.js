import pool from '../configs/dbConfig.js';
import crypto from 'crypto';

const signUp = async (req, res) => {
  const data = req.body;
  const username = data.username;
  const password = data.password;
  try {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const result = await pool.query(`
      INSERT INTO moderators (username, password_hash, role) VALUES ($1, $2, $3)
      `, [username, passwordHash, 'admin']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signIn = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const result = await pool.query(`
          SELECT * FROM moderators WHERE username = $1 AND password_hash = $2
          `, [username, passwordHash]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const session = await pool.query(`
          INSERT INTO sessions (moderator_id, expires_at) VALUES ($1, $2)
          RETURNING id
          `, [result.rows[0].id, expiresAt]);
        res.status(200).json({ sessionToken: session.rows[0].id, expiresAt: expiresAt.toISOString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { signUp, signIn };
