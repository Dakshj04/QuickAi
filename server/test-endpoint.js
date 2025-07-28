import express from 'express';

const app = express();

app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    env_vars: {
      has_database_url: !!process.env.DATABASE_URL,
      has_cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      has_clerk: !!process.env.CLERK_SECRET_KEY,
      has_openai: !!process.env.OPENAI_API_KEY,
      has_gemini: !!process.env.GEMINI_API_KEY
    }
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

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({ success: false, message: 'DATABASE_URL not provided' });
    }
    
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`SELECT 1 as test`;
    res.json({ success: true, message: 'Database connection successful', result });
  } catch (error) {
    res.json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Test Cloudinary connection
app.get('/test-cloudinary', async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.json({ success: false, message: 'Cloudinary credentials not provided' });
    }
    
    const { v2 as cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    res.json({ success: true, message: 'Cloudinary configured successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Cloudinary configuration failed', error: error.message });
  }
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