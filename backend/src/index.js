const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Streaming backend is running',
    timestamp: new Date(),
    nodeVersion: process.version
  });
});

app.get('/api/health', async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date(),
      service: 'streaming-backend'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: {
      express: 'loaded',
      cors: 'working',
      timestamp: new Date()
    }
  });
});

// Stream creation endpoint
app.post('/api/streams/create', async (req, res) => {
  try {
    const { title = 'New Stream', description = '', userId = 1 } = req.body;
    
    const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate database response
    const stream = {
      id: Math.floor(Math.random() * 1000),
      user_id: userId,
      title,
      description,
      stream_key: streamKey,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Stream created:', streamKey);
    
    res.json({ 
      success: true, 
      data: stream,
      message: 'Stream created successfully'
    });
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to create stream'
    });
  }
});

// Active streams endpoint
app.get('/api/streams/active', async (req, res) => {
  try {
    // Simulate active streams
    const streams = [
      {
        streamKey: 'test_stream_123',
        startedAt: new Date(),
        viewerCount: 5,
        clientIp: '127.0.0.1'
      }
    ];
    
    res.json({ success: true, data: streams });
  } catch (error) {
    console.error('Error getting active streams:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Viewer count endpoints
app.post('/api/streams/:streamKey/viewer-join', async (req, res) => {
  try {
    const { streamKey } = req.params;
    
    // Simulate viewer count
    const viewerCount = Math.floor(Math.random() * 10) + 1;
    
    res.json({ success: true, viewerCount });
  } catch (error) {
    console.error('Error viewer join:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/streams/:streamKey/viewer-leave', async (req, res) => {
  try {
    const { streamKey } = req.params;
    
    // Simulate viewer count
    const viewerCount = Math.floor(Math.random() * 5);
    
    res.json({ success: true, viewerCount });
  } catch (error) {
    console.error('Error viewer leave:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stream callbacks (simplified for testing)
app.post('/api/stream/start', async (req, res) => {
  try {
    console.log('Stream start body:', req.body);
    const { name: streamKey, addr } = req.body;
    
    if (!streamKey) {
      return res.status(400).send('Stream key required');
    }

    console.log(`Stream started: ${streamKey} from ${addr}`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream start error:', error);
    res.status(500).send('Error');
  }
});

app.post('/api/stream/end', async (req, res) => {
  try {
    console.log('Stream end body:', req.body);
    const { name: streamKey } = req.body;
    
    if (!streamKey) {
      return res.status(400).send('Stream key required');
    }

    console.log(`Stream ended: ${streamKey}`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream end error:', error);
    res.status(500).send('Error');
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Streaming backend running on port ${port}`);
  console.log(`✅ Health check: http://localhost:${port}/health`);
  console.log(`✅ API test: http://localhost:${port}/api/test`);
  console.log(`✅ Node.js version: ${process.version}`);
});