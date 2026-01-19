import express from 'express';
import { createUserProfile, getProfile, updateProfile } from '../controllers/user.controller.js';
import { authenticateToken } from '../utils/authentication.js';

const userRouter = express.Router();

userRouter.post('/create', authenticateToken, createUserProfile);

userRouter.get('/getProfile', authenticateToken, getProfile);

userRouter.put('/updateProfile', authenticateToken, updateProfile);

export default userRouter;