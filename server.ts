import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import { connectDB } from './src/backend/lib/db.js';
import { initSocket } from './src/backend/lib/socket.js';
import authRoutes from './src/backend/routes/auth.js';
import userRoutes from './src/backend/routes/users.js';
import messageRoutes from './src/backend/routes/messages.js';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);

  // Initialize Socket.IO
  initSocket(httpServer);

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/messages', messageRoutes);

  // Catch-all for undefined API routes to return JSON
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Connect to DB and start server
  connectDB().then(() => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to connect to database. Starting server anyway to show errors UI.');
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running without DB on http://0.0.0.0:${PORT}`);
    });
  });
}

startServer();
