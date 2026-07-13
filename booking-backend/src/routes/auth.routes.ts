import { Router } from 'express';
import { login, logout, register } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.use(authRateLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

export default router;
