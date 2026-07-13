import { Router } from 'express';
import { getMe, listUsers, updateMe, updateRole } from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);

router.get('/', requireRole('admin'), listUsers);
router.patch('/:id/role', requireRole('admin'), updateRole);

export default router;
