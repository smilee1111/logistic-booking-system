import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

export default app;