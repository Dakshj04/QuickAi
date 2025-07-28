# Vercel Server Deployment Guide

## Issues Fixed

1. **Authentication Middleware**: Made Clerk authentication optional for deployment
2. **File Upload**: Updated multer to use memory storage instead of disk storage
3. **Serverless Configuration**: Updated vercel.json for proper serverless deployment
4. **Error Handling**: Added proper error handling for missing environment variables
5. **File Processing**: Updated controllers to work with memory buffers instead of file paths

## Environment Variables Required

Add these in your Vercel project settings:

### Required:
- `DATABASE_URL` - Your Neon database connection string
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `OPENAI_API_KEY` - Your OpenAI API key
- `GEMINI_API_KEY` - Your Gemini API key

### Optional:
- `CLERK_SECRET_KEY` - Your Clerk secret key (for authentication)
- `NODE_ENV` - Set to "production" for Vercel deployment

## Deployment Steps

1. **Connect Repository to Vercel**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Set root directory to `server`

2. **Configure Environment Variables**
   - In Vercel project settings, add all required environment variables
   - Make sure to use the exact variable names listed above

3. **Deploy**
   - Vercel will automatically detect the Node.js project
   - The server will be deployed as serverless functions

## API Endpoints

### Health Checks:
- `GET /` - Basic health check
- `GET /health` - Detailed server status

### AI Endpoints (require authentication if CLERK_SECRET_KEY is set):
- `POST /api/ai/generate-article` - Generate articles
- `POST /api/ai/generate-blog-title` - Generate blog titles
- `POST /api/ai/generate-images` - Generate images
- `POST /api/ai/remove-background` - Remove image background
- `POST /api/ai/remove-object` - Remove objects from images
- `POST /api/ai/resume-review` - Review resumes

### User Endpoints:
- `GET /api/user/get-user-creations` - Get user creations
- `GET /api/user/get-published-creations` - Get published creations
- `POST /api/user/toggle-like-creation` - Toggle like on creation

## Testing Deployment

1. **Health Check**: Visit your deployed URL to see if server is running
2. **API Test**: Use the `/health` endpoint to verify server status
3. **Authentication**: If CLERK_SECRET_KEY is not set, endpoints will work without authentication

## Troubleshooting

### Common Issues:

1. **Environment Variables Missing**
   - Check Vercel project settings
   - Ensure all required variables are set

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if Neon database is accessible

3. **File Upload Issues**
   - Files are now processed in memory
   - No temporary files are created

4. **Authentication Issues**
   - If CLERK_SECRET_KEY is not set, authentication is skipped
   - This allows testing without Clerk setup

## Notes

- The server is now configured for serverless deployment
- File uploads use memory storage (no disk access)
- Authentication is optional for deployment
- All endpoints have proper error handling
- Database operations use Neon serverless database 