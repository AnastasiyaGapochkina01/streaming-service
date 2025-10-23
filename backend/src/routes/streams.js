const express = require('express');
const {
  startStream,
  endStream,
  getStreamStatus
} = require('../controllers/streamController');

const router = express.Router();

router.post('/start', startStream);
router.post('/end', endStream);
router.get('/status/:streamKey', getStreamStatus);

module.exports = router;
