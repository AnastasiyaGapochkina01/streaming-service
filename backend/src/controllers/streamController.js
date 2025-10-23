const Stream = require('../models/Stream');
const redisClient = require('../services/redis');

const startStream = async (req, res) => {
  const { name: streamKey } = req.body;
  
  try {
    const stream = await Stream.findByKey(streamKey);
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    await Stream.updateStatus(streamKey, 'live');
    await redisClient.set(`stream:${streamKey}`, 'live');
    await redisClient.set(`viewers:${streamKey}`, 0);
    
    res.status(200).json({ status: 'Stream started' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const endStream = async (req, res) => {
  const { name: streamKey } = req.body;

  try {
    await Stream.updateStatus(streamKey, 'offline');
    await redisClient.del(`stream:${streamKey}`);
    await redisClient.del(`viewers:${streamKey}`);
    
    res.status(200).json({ status: 'Stream ended' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStreamStatus = async (req, res) => {
  const { streamKey } = req.params;
  
  try {
    const status = await redisClient.get(`stream:${streamKey}`);
    const viewers = await redisClient.get(`viewers:${streamKey}`);
    
    res.json({ 
      status: status || 'offline',
      viewers: parseInt(viewers) || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { startStream, endStream, getStreamStatus };
