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

// Test environment variables
app.get('/env', (req, res) => {
  res.json({
    success: true,
    environment_variables: {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  });
});

// Initialize routes asynchronously
const initializeRoutes = async () => {
  try {
    // Only import and use Clerk if the secret key is available
    if (process.env.CLERK_SECRET_KEY) {
      const clerkModule = await import('@clerk/express');
      
      app.use(clerkModule.clerkMiddleware());
      
      // Import routes
      const aiRouter = (await import('./routes/aiRoutes.js')).default;
      const userRouter = (await import('./routes/userRoutes.js')).default;
      
      app.use('/api/ai', clerkModule.requireAuth(), aiRouter);
      app.use('/api/user', clerkModule.requireAuth(), userRouter);
      
      console.log('Server running with Clerk authentication');
    } else {
      // Import routes without authentication
      const aiRouter = (await import('./routes/aiRoutes.js')).default;
      const userRouter = (await import('./routes/userRoutes.js')).default;
      
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
};

// Initialize routes
initializeRoutes();

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

// Start server for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
  });
}

// Export for Vercel deployment
export default app;