const multer = require('multer');
const { uploadToS3 } = require('../services/s3');
const { pool } = require('../models/db');

// Configure multer for memory storage with larger limits
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    fields: 10,
    files: 1,
    parts: 20
  },
  fileFilter: (req, file, cb) => {
    // Allow video, image, and audio files
    const allowedMimes = [
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-flv',
      'video/webm', 'video/3gpp', 'video/ogg',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/webm'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only media files are allowed.`), false);
    }
  }
});

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    
    // Генерируем уникальное имя файла без привязки к пользователю
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = originalname.split('.').pop();
    const fileName = `media/public/${timestamp}-${randomString}.${fileExtension}`;

    console.log(`Uploading file: ${fileName}, Size: ${size} bytes, Type: ${mimetype}`);

    // Upload to S3
    const s3Result = await uploadToS3(buffer, fileName, mimetype);

    // Store metadata in database (без user_id)
    const result = await pool.query(
      `INSERT INTO uploaded_media 
       (file_name, original_name, s3_url, mime_type, file_size, uploaded_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [fileName, originalname, s3Result.Location, mimetype, size]
    );

    console.log(`File uploaded successfully: ${s3Result.Location}`);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      media: {
        id: result.rows[0].id,
        url: s3Result.Location,
        fileName: originalname,
        mimeType: mimetype,
        size: size,
        uploadedAt: result.rows[0].uploaded_at
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
};

const getUserMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Получаем все медиафайлы (без привязки к пользователю)
    const result = await pool.query(
      `SELECT id, original_name, s3_url, mime_type, file_size, uploaded_at 
       FROM uploaded_media 
       ORDER BY uploaded_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM uploaded_media'
    );

    res.json({
      media: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    // Удаляем без проверки пользователя
    const mediaResult = await pool.query(
      'SELECT * FROM uploaded_media WHERE id = $1',
      [mediaId]
    );

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Удаляем из базы данных
    await pool.query(
      'DELETE FROM uploaded_media WHERE id = $1',
      [mediaId]
    );

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

module.exports = {
  uploadMedia,
  getUserMedia,
  deleteMedia,
  uploadMiddleware: upload.single('file')
};
