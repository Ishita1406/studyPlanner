import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import subjectRouter from './routes/subject.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use('/auth', authRouter);
app.use('/profile', userRouter);
app.use('/subject', subjectRouter);

let port = 8000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log(error);
    });