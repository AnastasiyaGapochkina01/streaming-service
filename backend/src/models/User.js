const { pool } = require('./db');

class User {
  static async create(email, passwordHash) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, created_at) 
       VALUES ($1, $2, NOW()) RETURNING id, email, created_at`,
      [email, passwordHash]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async createStreamKey(userId, streamKey) {
    const result = await pool.query(
      `INSERT INTO streams (user_id, stream_key, status, created_at) 
       VALUES ($1, $2, 'offline', NOW()) RETURNING *`,
      [userId, streamKey]
    );
    return result.rows[0];
  }

  static async getUserStreams(userId) {
    const result = await pool.query(
      `SELECT id, stream_key, status, created_at, updated_at 
       FROM streams WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = User;
