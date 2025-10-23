const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { pool } = require('./models/db');
const redisClient = require('./services/redis');
const streamRoutes = require('./routes/streams');
const uploadRoutes = require('./routes/upload');
// Убираем импорт authRoutes

const app = express();

// Middleware - увеличиваем лимиты для больших файлов
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Routes
app.use('/api/streams', streamRoutes);
app.use('/api/upload', uploadRoutes);
// Убираем authRoutes

// Health check with detailed status
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'Unknown',
      redis: 'Unknown'
    }
  };

  try {
    await pool.query('SELECT 1');
    healthCheck.services.database = 'OK';
  } catch (err) {
    healthCheck.services.database = 'FAILED';
    healthCheck.status = 'DEGRADED';
  }

  try {
    await redisClient.ping();
    healthCheck.services.redis = 'OK';
  } catch (err) {
    healthCheck.services.redis = 'FAILED';
    healthCheck.status = 'DEGRADED';
  }

  const statusCode = healthCheck.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large',
        maxSize: '500MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected field',
        details: 'Check the field name for file upload'
      });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`File upload limit: 500MB`);
  console.log(`Upload authentication: DISABLED`);
});
