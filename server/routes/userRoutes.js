import express from 'express'
import { auth } from '../middlewares/auth.js';
import {  getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/userController.js';

const userRouter = express.Router();

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

userRouter.get('/get-user-creations', optionalAuth, getUserCreations)
userRouter.get('/get-published-creations', optionalAuth, getPublishedCreations)
userRouter.post('/toggle-like-creation', optionalAuth, toggleLikeCreation)

export default userRouter;