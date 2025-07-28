import express from 'express';
import cors from 'cors';
import "dotenv/config";

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (always available)
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is Live',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Conditional imports and middleware setup
let aiRouter, userRouter;

try {
  // Only import and use Clerk if the secret key is available
  if (process.env.CLERK_SECRET_KEY) {
    const clerkModule = await import('@clerk/express');
    
    app.use(clerkModule.clerkMiddleware());
    
    // Import routes
    aiRouter = (await import('./routes/aiRoutes.js')).default;
    userRouter = (await import('./routes/userRoutes.js')).default;
    
    app.use('/api/ai', clerkModule.requireAuth(), aiRouter);
    app.use('/api/user', clerkModule.requireAuth(), userRouter);
    
    console.log('Server running with Clerk authentication');
  } else {
    // Import routes without authentication
    aiRouter = (await import('./routes/aiRoutes.js')).default;
    userRouter = (await import('./routes/userRoutes.js')).default;
    
    app.use('/api/ai', aiRouter);
    app.use('/api/user', userRouter);
    
    console.log('Server running without Clerk authentication');
  }
  
  // Try to initialize Cloudinary if credentials are available
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const connectCloudinary = (await import('./configs/cloudinary.js')).default;
    try {
      await connectCloudinary();
      console.log('Cloudinary connected successfully');
    } catch (error) {
      console.log('Cloudinary connection failed:', error.message);
    }
  } else {
    console.log('Cloudinary credentials not provided, skipping initialization');
  }
  
} catch (error) {
  console.error('Error setting up routes:', error.message);
  
  // Fallback error handler
  app.use('/api/*', (req, res) => {
    res.status(500).json({ 
      success: false, 
      message: 'Server configuration error. Please check environment variables.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
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