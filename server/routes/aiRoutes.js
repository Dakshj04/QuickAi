import express from 'express'
import { auth } from '../middlewares/auth.js';
import { 
    generateArticles, 
    generateBlogTitle, 
    generateImage, 
    removeImageBackground, 
    removeImageObject, 
    resumeReview  // ← Make sure this matches your controller function name
} from '../controllers/aiController.js';
import { upload } from '../configs/multer.js';

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticles)
aiRouter.post('/generate-blog-title', auth, generateBlogTitle)
aiRouter.post('/generate-images', auth, generateImage)
aiRouter.post('/remove-background', auth, upload.single('image'), removeImageBackground)
aiRouter.post('/remove-object', auth, upload.single('image'), removeImageObject)
aiRouter.post('/resume-review', auth, upload.single('resume'), resumeReview) // ← Updated to use resumeReview
aiRouter.post('/resume-image', auth, upload.single('resume'), generateImage)

export default aiRouter