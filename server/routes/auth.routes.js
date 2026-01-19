import express from 'express';
import { createUser, getUser, loginUser } from '../controllers/auth.controller.js';
import { authenticateToken } from '../utils/authentication.js';

const authRouter = express.Router();

authRouter.post('/register', createUser);

authRouter.post('/login', loginUser);

authRouter.get('/get', authenticateToken, getUser);

export default authRouter;