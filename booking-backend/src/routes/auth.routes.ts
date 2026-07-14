import { Router } from 'express';
import { login, logout, register, verifyMfa } from '../controllers/auth.controller';
import { setup, verifySetup } from '../controllers/mfa.controller';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(authRateLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-mfa', verifyMfa);

router.post('/mfa/setup', requireAuth, setup);
router.post('/mfa/verify-setup', requireAuth, verifySetup);

export default router;
