# Server Deployment Guide

## Environment Variables Required for Vercel

Add these environment variables in your Vercel project settings:

### Required Variables:
- `DATABASE_URL` - Your Neon database connection string
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `OPENAI_API_KEY` - Your OpenAI API key

- `CLERK_SECRET_KEY` - Your Clerk secret key (for authentication)

## Deployment Steps:

1. **Connect your GitHub repository to Vercel**
2. **Set the root directory to `server`** in Vercel project settings
3. **Add all required environment variables** in Vercel project settings
4. **Deploy**

## API Endpoints:

- `GET /` - Health check
- `GET /health` - Server status
- `POST /api/ai/*` - AI-related endpoints
- `POST /api/user/*` - User-related endpoints

## Notes:

- The server will work without Clerk authentication if `CLERK_SECRET_KEY` is not provided
- File uploads are handled through Cloudinary
- Database operations use Neon serverless database 