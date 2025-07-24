import express from 'express'
import { auth } from '../middlewares/auth.js';
import { generateArticles } from '../controllers/aiController.js';


const aiRouter = express.Router();

aiRouter.post('/generate-article',auth,generateArticles)

export default aiRouter