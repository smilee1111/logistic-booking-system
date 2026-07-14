import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import resourceRoutes from './routes/resource.routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

export default app;