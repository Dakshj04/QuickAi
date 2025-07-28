import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// Initialize Cloudinary
try {
  await connectCloudinary();
} catch (error) {
  console.log('Cloudinary connection failed:', error.message);
}

app.use(cors());
app.use(express.json());

// Make Clerk middleware optional for deployment
if (process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
  // Only apply requireAuth to specific routes that need it
  app.use('/api/ai', requireAuth(), aiRouter);
  app.use('/api/user', requireAuth(), userRouter);
} else {
  // Fallback without authentication for testing
  console.log('Running without Clerk authentication');
  app.use('/api/ai', aiRouter);
  app.use('/api/user', userRouter);
}

app.get('/', (req, res) => {
  res.send("Server is Live");
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

// For Vercel deployment, export the app
if (process.env.NODE_ENV === 'production') {
  // Vercel serverless function export
  export default app;
} else {
  // Local development
  app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
  });
}