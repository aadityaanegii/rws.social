import express from 'express';
import cors from 'cors';
import { connectDB } from '../src/backend/lib/db.js';
import authRoutes from '../src/backend/routes/auth.js';
import userRoutes from '../src/backend/routes/users.js';
import messageRoutes from '../src/backend/routes/messages.js';

const app = express();

app.use(cors());
app.use(express.json());

// Since Vercel is serverless, we must ensure DB is connected before handling requests.
// We'll use a middleware to ensure connection on every request.
let isDBConnected = false;
app.use(async (req, res, next) => {
  if (!isDBConnected) {
    try {
      // In Vercel, memory server won't work well due to read-only FS and timeout,
      // so if MONGODB_URI is absent, we'll throw a clear error.
      if (!process.env.MONGODB_URI && process.env.VERCEL) {
         return res.status(500).json({ 
           message: 'Vercel deployment requires MONGODB_URI environment variable to be set in Vercel Dashboard.' 
         });
      }
      await connectDB();
      isDBConnected = true;
    } catch (e) {
      console.error('DB Connection Error:', e);
      // Return the actual error message so the user can debug (e.g. IP allowlist in MongoDB Atlas)
      return res.status(500).json({ 
        message: 'Database connection failed: ' + (e instanceof Error ? e.message : String(e)) 
      });
    }
  }
  next();
});

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

export default app;
