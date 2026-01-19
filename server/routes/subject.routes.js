import express from 'express';
import { createSubject, deleteSubject, getSubjectById, getSubjects, updateSubject } from '../controllers/subject.controller.js';
import { authenticateToken } from '../utils/authentication.js';

const subjectRouter = express.Router();

subjectRouter.post('/create', authenticateToken, createSubject);

subjectRouter.get('/getAll', authenticateToken, getSubjects);

subjectRouter.get('/get/:id', authenticateToken, getSubjectById);

subjectRouter.put('/update/:id', authenticateToken, updateSubject);

subjectRouter.delete('/delete/:id', authenticateToken, deleteSubject);

export default subjectRouter;