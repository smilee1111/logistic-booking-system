import { Router } from 'express';
import { list } from '../controllers/log.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', list);

export default router;
