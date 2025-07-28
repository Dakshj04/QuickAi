import express from 'express'
import { auth } from '../middlewares/auth.js';
import { 
    generateArticles, 
    generateBlogTitle, 
    generateImage, 
    removeImageBackground, 
    removeImageObject, 
    resumeReview
} from '../controllers/aiController.js';
import { upload } from '../configs/multer.js';

const aiRouter = express.Router();

// Middleware to handle optional authentication
const optionalAuth = async (req, res, next) => {
    if (process.env.CLERK_SECRET_KEY) {
        return auth(req, res, next);
    } else {
        // Skip authentication for deployment testing
        req.plan = 'free';
        req.free_usage = 0;
        next();
    }
};

aiRouter.post('/generate-article', optionalAuth, generateArticles)
aiRouter.post('/generate-blog-title', optionalAuth, generateBlogTitle)
aiRouter.post('/generate-images', optionalAuth, generateImage)
aiRouter.post('/remove-background', optionalAuth, upload.single('image'), removeImageBackground)
aiRouter.post('/remove-object', optionalAuth, upload.single('image'), removeImageObject)
aiRouter.post('/resume-review', optionalAuth, upload.single('resume'), resumeReview)
aiRouter.post('/resume-image', optionalAuth, upload.single('resume'), generateImage)

export default aiRouter