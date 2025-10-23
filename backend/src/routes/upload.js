const express = require('express');
const {
  uploadMedia,
  getUserMedia,
  deleteMedia,
  uploadMiddleware
} = require('../controllers/uploadController');
// Убираем импорт authMiddleware

const router = express.Router();

// Убираем authMiddleware для всех маршрутов загрузки
router.post('/', uploadMiddleware, uploadMedia);
router.get('/', getUserMedia);
router.delete('/:mediaId', deleteMedia);

module.exports = router;
