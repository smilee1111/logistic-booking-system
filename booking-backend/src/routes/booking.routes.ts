import { Router } from 'express';
import { cancel, create, decide, exportMine, getAll, getMine, getOne } from '../controllers/booking.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', create);
router.get('/me', getMine);
router.get('/export', exportMine);
router.get('/:id', getOne);
router.patch('/:id/cancel', cancel);

router.get('/', requireRole('admin'), getAll);
router.patch('/:id/decision', requireRole('admin'), decide);

export default router;
