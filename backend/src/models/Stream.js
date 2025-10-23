const { pool } = require('./db');

class Stream {
  static async create(streamKey, userId) {
    const result = await pool.query(
      'INSERT INTO streams (stream_key, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [streamKey, userId, 'offline']
    );
    return result.rows[0];
  }

  static async findByKey(streamKey) {
    const result = await pool.query(
      'SELECT * FROM streams WHERE stream_key = $1',
      [streamKey]
    );
    return result.rows[0];
  }

  static async updateStatus(streamKey, status) {
    await pool.query(
      'UPDATE streams SET status = $1, updated_at = NOW() WHERE stream_key = $2',
      [status, streamKey]
    );
  }
}

module.exports = Stream;
