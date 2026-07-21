import { Router } from 'express';
import { googleLogin, login, logout, refresh, register, verifyMfa } from '../controllers/auth.controller';
import { setup, verifySetup } from '../controllers/mfa.controller';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(authRateLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/verify-mfa', verifyMfa);

router.post('/mfa/setup', requireAuth, setup);
router.post('/mfa/verify-setup', requireAuth, verifySetup);

export default router;
