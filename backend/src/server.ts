import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';

import { aiRoutes } from './routes/ai';
import { projectRoutes } from './routes/projects';
import { errorHandler } from './middleware/errorHandler';
import { AIService } from './services/AIService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'http://localhost:3000' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// WebSocket connection for real-time AI progress updates
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        case 'subscribe_ai_progress':
          // Subscribe to AI generation progress
          ws.send(JSON.stringify({ 
            type: 'subscribed', 
            channel: 'ai_progress',
            message: 'Subscribed to AI progress updates'
          }));
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Olori Animate Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  
  // Initialize AI service and set WebSocket server
  AIService.setWebSocketServer(wss);
  AIService.initialize().then(() => {
    console.log('🤖 AI Service initialized successfully');
  }).catch((error) => {
    console.error('❌ Failed to initialize AI Service:', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { wss };