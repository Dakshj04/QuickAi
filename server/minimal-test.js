import express from 'express';

const app = express();

app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Minimal test server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
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

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default app; 