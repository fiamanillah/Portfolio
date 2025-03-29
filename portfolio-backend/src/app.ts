import express, { Request, Response } from 'express';
import cors from 'cors';
import errorMiddleware from './middleware/errorHandler';
import formRoutes from './routes/formRoutes';
import imageUploadRouter from './routes/imageUpload';
import blogRoutes from './routes/blogRoutes';
const app = express();

// CORS configuration
app.use(
    cors({
        origin: [
            'https://fi.amanillah.com',
            'https://amanillah.com',
            'https://www.amanillah.com',
            'http://localhost:3010',
            'http://localhost:3000',
        ], // Allow only your frontend domain
        credentials: true, // Allow credentials if needed
    })
);

app.use('/uploads', express.static('uploads'));

// Middleware
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

// Routes
app.use('/api/form', formRoutes);
app.use('/api/uploadImage', imageUploadRouter);
app.use('/api/blog', blogRoutes);
// Error handling middleware
app.use(errorMiddleware);

export default app;
