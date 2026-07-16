import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import resourceRoutes from './routes/resource.routes';
import bookingRoutes from './routes/booking.routes';
import { errorHandler } from './middlewares/errorHandler';
import { FRONTEND_ORIGIN } from './config';

const app: Application = express();

app.use(helmet());
// Not strictly load-bearing today — the browser only ever talks to the Next.js
// server, which calls this backend server-to-server (not subject to CORS at
// all). Locked down anyway so a direct browser-to-backend call is never
// silently possible if the architecture changes later.
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

export default app;